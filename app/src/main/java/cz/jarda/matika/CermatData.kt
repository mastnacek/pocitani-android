package cz.jarda.matika

import android.content.ContentResolver
import android.net.Uri
import android.provider.DocumentsContract
import android.provider.DocumentsContract.Document
import android.webkit.WebResourceResponse
import androidx.webkit.WebViewAssetLoader
import org.json.JSONObject
import java.io.ByteArrayInputStream
import java.io.File
import java.io.FileInputStream

/**
 * Testy CERMAT nahrané do telefonu. Nejsou součástí APK ani gitu (autorská práva CERMAT).
 *
 * Struktura v soukromé složce aplikace (root = …/Android/data/cz.jarda.matika/files/cermat):
 *   cestina/      matematika/
 *     prehled-testu.json        seznam testů; podle něj stránka pozná, že předmět je nahraný
 *     odpovedi/{rok}-{termín}.json   zadání + správné odpovědi z CERMAT TAU
 *     obrazky/tasks/{id}/…      obrázky zadání, řešení a bodovacích klíčů
 * Stránka je čte přes https://appassets.androidplatform.net/cermat/… (PathHandler níž).
 */
object CermatData {
    val SUBJECTS = setOf("cestina", "matematika")

    /** Soubory z `root` pro WebView. Mimo `root` (třeba přes ../) nic nevydá. */
    class PathHandler(private val root: () -> File) : WebViewAssetLoader.PathHandler {
        override fun handle(path: String): WebResourceResponse {
            val base = root().canonicalFile
            val f = File(base, path).canonicalFile
            if (!f.path.startsWith(base.path + File.separator) || !f.isFile) {
                return WebResourceResponse("text/plain", "utf-8", 404, "Not Found", emptyMap(), ByteArrayInputStream(ByteArray(0)))
            }
            val mime =
                when (f.extension.lowercase()) {
                    "json" -> "application/json"
                    "png" -> "image/png"
                    "jpg", "jpeg" -> "image/jpeg"
                    "gif" -> "image/gif"
                    "webp" -> "image/webp"
                    "svg" -> "image/svg+xml"
                    else -> "application/octet-stream"
                }
            return WebResourceResponse(mime, if (mime == "application/json") "utf-8" else null, FileInputStream(f))
        }
    }

    private data class Doc(val id: String, val name: String, val dir: Boolean, val size: Long)

    private data class Item(val rel: String, val id: String, val size: Long)

    private fun children(cr: ContentResolver, tree: Uri, parentId: String): List<Doc> {
        val uri = DocumentsContract.buildChildDocumentsUriUsingTree(tree, parentId)
        val cols = arrayOf(Document.COLUMN_DOCUMENT_ID, Document.COLUMN_DISPLAY_NAME, Document.COLUMN_MIME_TYPE, Document.COLUMN_SIZE)
        val out = ArrayList<Doc>()
        cr.query(uri, cols, null, null, null)?.use { c ->
            while (c.moveToNext()) {
                out += Doc(c.getString(0), c.getString(1) ?: "", c.getString(2) == Document.MIME_TYPE_DIR, if (c.isNull(3)) -1 else c.getLong(3))
            }
        }
        return out
    }

    private fun walk(cr: ContentResolver, tree: Uri, dirId: String, rel: String, into: MutableList<Item>) {
        for (d in children(cr, tree, dirId)) {
            if (d.name.startsWith(".")) continue
            if (d.dir) walk(cr, tree, d.id, "$rel/${d.name}", into) else into += Item("$rel/${d.name}", d.id, d.size)
        }
    }

    /**
     * Zkopíruje předměty z vybrané složky do `root`. Vybrat jde přímo složku `cestina` / `matematika`,
     * nebo složku, která je obsahuje (třeba `cermat-tau` nebo Download). Už zkopírované soubory
     * se stejnou velikostí přeskočí, takže přerušený import jde zopakovat.
     * `progress` dostává JSON: phase = scan | copy | done | error.
     */
    fun import(cr: ContentResolver, tree: Uri, root: File, progress: (JSONObject) -> Unit) {
        try {
            val rootId = DocumentsContract.getTreeDocumentId(tree)
            progress(JSONObject().put("phase", "scan"))
            // předměty: vybraná složka sama, její podsložky, nebo o úroveň hlouběji
            val rootName =
                cr.query(DocumentsContract.buildDocumentUriUsingTree(tree, rootId), arrayOf(Document.COLUMN_DISPLAY_NAME), null, null, null)
                    ?.use { if (it.moveToFirst()) it.getString(0) else null } ?: ""
            val found = LinkedHashMap<String, String>()
            if (rootName in SUBJECTS) {
                found[rootName] = rootId
            } else {
                val level1 = children(cr, tree, rootId).filter { it.dir }
                level1.filter { it.name in SUBJECTS }.forEach { found.putIfAbsent(it.name, it.id) }
                if (found.isEmpty()) {
                    for (d in level1) children(cr, tree, d.id).filter { it.dir && it.name in SUBJECTS }.forEach { found.putIfAbsent(it.name, it.id) }
                }
            }
            if (found.isEmpty()) {
                progress(JSONObject().put("phase", "error").put("msg", "Ve vybrané složce není složka cestina ani matematika."))
                return
            }

            // co se kopíruje: prehled-testu.json, odpovedi/*.json, obrazky/**
            val plan = LinkedHashMap<String, Pair<Item, List<Item>>>()
            for ((subj, id) in found) {
                val kids = children(cr, tree, id)
                val prehled = kids.firstOrNull { !it.dir && it.name == "prehled-testu.json" }
                val odpovedi = kids.firstOrNull { it.dir && it.name == "odpovedi" }
                if (prehled == null || odpovedi == null) {
                    progress(JSONObject().put("phase", "error").put("msg", "Ve složce $subj chybí prehled-testu.json nebo složka odpovedi."))
                    return
                }
                val files = ArrayList<Item>()
                walk(cr, tree, odpovedi.id, "odpovedi", files)
                kids.firstOrNull { it.dir && it.name == "obrazky" }?.let { walk(cr, tree, it.id, "obrazky", files) }
                plan[subj] = Item("prehled-testu.json", prehled.id, prehled.size) to files.filter { it.rel.startsWith("obrazky/") || it.rel.endsWith(".json") }
            }
            val total = plan.values.sumOf { it.second.size + 1 }
            val totalBytes = plan.values.sumOf { (p, l) -> p.size.coerceAtLeast(0) + l.sumOf { it.size.coerceAtLeast(0) } }
            var done = 0
            var bytes = 0L
            var last = 0L
            fun report(force: Boolean) {
                val now = System.currentTimeMillis()
                if (!force && now - last < 200) return
                last = now
                progress(
                    JSONObject().put("phase", "copy").put("files", done).put("totalFiles", total)
                        .put("bytes", bytes).put("totalBytes", totalBytes).put("subjects", plan.keys.joinToString(",")),
                )
            }
            val buf = ByteArray(64 * 1024)
            fun copy(subj: String, item: Item) {
                val dest = File(root, "$subj/${item.rel}")
                if (!(dest.isFile && item.size >= 0 && dest.length() == item.size)) {
                    dest.parentFile?.mkdirs()
                    val part = File(dest.path + ".part")
                    cr.openInputStream(DocumentsContract.buildDocumentUriUsingTree(tree, item.id))!!.use { inp ->
                        part.outputStream().use { out ->
                            while (true) {
                                val n = inp.read(buf)
                                if (n < 0) break
                                out.write(buf, 0, n)
                                bytes += n
                                report(false)
                            }
                        }
                    }
                    if (dest.exists()) dest.delete()
                    if (!part.renameTo(dest)) throw IllegalStateException("Nejde uložit ${dest.name}.")
                } else {
                    bytes += item.size
                }
                done++
                report(false)
            }
            for ((subj, p) in plan) {
                // během kopírování předmět „není nahraný“; přehled se zapíše až nakonec
                File(root, "$subj/prehled-testu.json").delete()
                for (item in p.second) copy(subj, item)
                copy(subj, p.first)
            }
            report(true)
            progress(JSONObject().put("phase", "done").put("subjects", plan.keys.joinToString(",")).put("files", done))
        } catch (e: Exception) {
            progress(JSONObject().put("phase", "error").put("msg", e.message ?: e.toString()))
        }
    }
}
