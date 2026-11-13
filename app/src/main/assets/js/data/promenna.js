'use strict';
// šablony: každá vrací zadání, dva cílové výrazy, rovnici L = R a typické chyby ve výrazech (s radou)
const PROMENNA=[
 {lv:1,f(){const v='x',x=ri(5,30)*100,d=ri(2,9)*100,m=pick([2,3,4]);const e1=LP(1,d),e2=LP(m,m*d),L=P.add(P.add(LP(1,0),e1),e2),R=evalP(L,Fr(x));
  return{v,x:Fr(x),unit:'Kč',e:[e1,e2],L,R,
   text:`Do pokoje jsme koupili noční stolek, židli a skříň. Židle byla o ${fmtNum(d)} Kč dražší než noční stolek. Skříň byla ${KRAT[m]} dražší než židle. Cenu nočního stolku v korunách označíme ${v}.`,
   q:[`Vyjádřete výrazem s proměnnou ${v} cenu židle.`,`Vyjádřete výrazem s proměnnou ${v} cenu skříně.`,`Za všechny tři kusy nábytku jsme zaplatili ${fmtNum(R.n)} Kč. Vypočtěte, kolik korun stál noční stolek.`],
   kroky:[[`Židle je o ${fmtNum(d)} Kč dražší než stolek, takže k ceně stolku přičteme ${fmtNum(d)}.`,polyH(e1,v)],
     [`Skříň je ${KRAT[m]} dražší než celá židle, proto ${K('celou cenu židle dáme do závorky')} a vynásobíme ${m}.`,`${m} · (${polyH(e1,v)}) = ${polyH(e2,v)}`]],
   uvod:`Sečteme ceny všech tří kusů a položíme je rovné ${fmtNum(R.n)}. Levou stranu upravíme:`,
   chyby:[[],[{p:LP(m,d),rada:`Skříň je ${KRAT[m]} dražší než celá židle. Celou cenu židle dej do závorky: ${m}·(${v} + ${d}).`},{p:LP(m,0),rada:`Skříň je ${KRAT[m]} dražší než židle, ne než stolek: ${m}·(${v} + ${d}).`}]]}}},
 {lv:1,f(){const v='x',x=ri(9,15),d=ri(2,6),m=pick([3,4]);if(m*x<27||m*x>56)return null;const J=pick(JMENA.f);const e1=LP(1,d),e2=LP(m,0),L=P.add(P.add(LP(1,0),e1),e2),R=evalP(L,Fr(x));
  return{v,x:Fr(x),unit:'let',e:[e1,e2],L,R,
   text:`${J} má ${v} let. Její bratr je o ${d} ${d<5?'roky':'let'} starší. Maminka je ${KRAT[m]} starší než ${J}.`,
   q:[`Vyjádřete výrazem s proměnnou ${v} věk bratra.`,`Vyjádřete výrazem s proměnnou ${v} věk maminky.`,`Všichni tři mají dohromady ${R.n} let. Vypočtěte, kolik let má ${J}.`],
   kroky:[[`Bratr je starší, takže přičteme ${d}.`,polyH(e1,v)],[`${KRAT[m][0].toUpperCase()+KRAT[m].slice(1)} starší znamená ${K('násobit')}.`,polyH(e2,v)]],
   uvod:`Sečteme věk všech tří a položíme ho rovný ${R.n}. Levou stranu upravíme:`,
   chyby:[[{p:LP(1,-d),rada:`Bratr je starší, takže k věku přičítáš: ${v} + ${d}.`}],[{p:LP(1,m),rada:`${cap(KRAT[m])} starší znamená násobit: ${m}·${v}, ne přičítat.`}]]}}},
 {lv:1,f(){const v='x',pc=pick([25,30,35]),pk=pick([40,45,50,55]),d=pick([10,15,20,30]),x=ri(20,80);const e1=LP(1,d),e2=LP(pc+pk,pk*d),L=e2,R=evalP(L,Fr(x));
  return{v,x:Fr(x),unit:'čajů',e:[e1,e2],L,R,
   text:`Ve stánku prodávají čaj za ${pc} Kč a kávu za ${pk} Kč. Dnes prodali o ${d} káv více než čajů. Počet prodaných čajů označíme ${v}.`,
   q:[`Vyjádřete výrazem s proměnnou ${v} počet prodaných káv.`,`Vyjádřete výrazem s proměnnou ${v}, kolik korun dnes utržili za všechny nápoje.`,`Za všechny nápoje dnes utržili ${fmtNum(R.n)} Kč. Vypočtěte, kolik čajů prodali.`],
   kroky:[[`Káv bylo o ${d} více než čajů.`,polyH(e1,v)],[`Za čaje utržili ${pc}·${V(v)}, za kávy ${pk}krát počet káv. ${K('Počet káv je v závorce')}.`,`${pc}${V(v)} + ${pk} · (${polyH(e1,v)}) = ${polyH(e2,v)}`]],
   uvod:`Tržba za všechny nápoje je ${fmtNum(R.n)} Kč:`,
   chyby:[[{p:LP(1,-d),rada:`Káv bylo o ${d} víc než čajů: ${v} + ${d}.`}],[{p:LP(pc+pk,d),rada:`Každá káva stojí ${pk} Kč, i těch ${d} navíc. Tržba za kávy je ${pk}·(${v} + ${d}).`},{p:LP(pc+pk,0),rada:`Káv bylo o ${d} víc než čajů, tržba za kávy je ${pk}·(${v} + ${d}).`}]]}}},
 {lv:1,f(){const v='x',x=ri(6,30),d=ri(3,12);const e1=LP(1,d),e2=LP(4,2*d),L=e2,R=evalP(L,Fr(x));
  return{v,x:Fr(x),unit:'m',e:[e1,e2],L,R,
   text:`Zahrada má tvar obdélníku. Delší strana je o ${d} m delší než kratší strana. Délku kratší strany v metrech označíme ${v}.`,
   q:[`Vyjádřete výrazem s proměnnou ${v} délku delší strany.`,`Vyjádřete výrazem s proměnnou ${v} obvod zahrady.`,`Obvod zahrady je ${fmtNum(R.n)} m. Vypočtěte v metrech délku kratší strany.`],
   kroky:[[`Delší strana je o ${d} m delší.`,polyH(e1,v)],[`${K('Obvod obdélníku tvoří dvě kratší a dvě delší strany')}.`,`2 · (${V(v)} + ${polyH(e1,v)}) = ${polyH(e2,v)}`]],
   uvod:`Obvod je ${fmtNum(R.n)} m:`,
   chyby:[[],[{p:LP(2,d),rada:`Obvod tvoří dvě kratší a dvě delší strany: 2·(${v} + ${v} + ${d}).`},{p:P.norm([Fr(0),Fr(d),Fr(1)]),rada:`To je obsah zahrady, ne obvod. Obvod: 2·(${v} + ${v} + ${d}).`}]]}}},
 {lv:2,f(){const v='x',n=pick([2,3,4,5]),w=ZLOMKY_SLOVY[n],d=ri(2,9),x=n*ri(3,12);const a=Fr(n+1,n);const e1=LP(a,0),e2=LP(a,-d);if(F.isZero(evalP(e2,Fr(x)))||evalP(e2,Fr(x)).n<0)return null;const L=P.add(P.add(LP(1,0),e1),e2),R=evalP(L,Fr(x));
  return{v,x:Fr(x),unit:'stromků',e:[e1,e2],L,R,
   text:`Dobrovolníci sázeli stromky. V úterý zasadili o ${w} stromků více než v pondělí a ve středu o ${d} stromků méně než v úterý. Počet stromků zasazených v pondělí označíme ${v}.`,
   q:[`Vyjádřete výrazem s proměnnou ${v}, kolik stromků zasadili v úterý.`,`Vyjádřete výrazem s proměnnou ${v}, kolik stromků zasadili ve středu.`,`Za tři dny zasadili celkem ${fmtNum(R.n)} stromků. Vypočtěte, kolik stromků zasadili v pondělí.`],
   kroky:[[`„O ${w} více“ znamená ${K(`pondělní počet a k tomu ještě ${w} z něj`)}.`,`${V(v)} + ${frBox(V(v),n)} = ${polyH(e1,v)}`],[`Ve středu o ${d} méně než v úterý.`,polyH(e2,v)]],
   uvod:`Sečteme všechny tři dny a položíme je rovné ${fmtNum(R.n)}. Levou stranu upravíme:`,
   chyby:[[{p:LP(Fr(1,n),0),rada:`„O ${w} více“ není jen ${w}. Je to pondělní počet a k tomu ještě ${w}: ${v} + ${v}/${n}.`}],[{p:LP(Fr(1,n),-d),rada:`„O ${w} více“ v úterý znamená ${v} + ${v}/${n}. Od toho ve středu odečti ${d}.`},{p:LP(1,-d),rada:`Ve středu bylo o ${d} méně než v úterý, ne než v pondělí. Od úterního výrazu odečti ${d}.`}]]}}},
 {lv:2,f(){const v='x',n=pick([3,4,5]),w=ZLOMKY_SLOVY[n],d=ri(1,6),k=ri(3,15),x=n*k,r3=(n-2)*k-d;if(r3<2)return null;const e1=LP(Fr(1,n),d),e2=LP(Fr(n-2,n),-d),L=e2,R=Fr(r3);
  return{v,x:Fr(x),unit:'km',e:[e1,e2],L,R,
   text:`Turisté šli po trase dlouhé ${v} km. První den ušli ${w} celé trasy, druhý den o ${d} km více než první den a třetí den došli zbytek trasy.`,
   q:[`Vyjádřete výrazem s proměnnou ${v}, kolik km ušli druhý den.`,`Vyjádřete výrazem s proměnnou ${v}, kolik km ušli třetí den.`,`Třetí den ušli ${r3} km. Vypočtěte, kolik km měřila celá trasa.`],
   kroky:[[`První den ušli ${frBox(V(v),n)}, druhý den o ${d} km víc.`,polyH(e1,v)],[`Třetí den je ${K('celá trasa bez prvního i druhého dne')}.`,`${V(v)} ${MINUS} ${frBox(V(v),n)} ${MINUS} (${polyH(e1,v)}) = ${polyH(e2,v)}`]],
   uvod:`Třetí den ušli ${r3} km:`,
   chyby:[[{p:LP(1,d),rada:`První den ušli jen ${w} trasy, tedy ${v}/${n}. Druhý den o ${d} víc: ${v}/${n} + ${d}.`}],[{p:LP(Fr(n-1,n),-d),rada:`Třetí den zbývá trasa bez prvního i druhého dne: ${v} − ${v}/${n} − (${v}/${n} + ${d}).`},{p:LP(Fr(n-2,n),d),rada:`Těch ${d} km navíc ušli druhý den, takže se od trasy odečítají: ${v} − ${v}/${n} − (${v}/${n} + ${d}).`}]]}}},
 {lv:2,f(){const v='x',n=pick([2,3,4]),w=ZLOMKY_SLOVY[n],s=ri(5,30)*10,k=ri(10,60)*10,x=n*k,zb=(n-1)*k-s;if(zb<20)return null;const e1=LP(Fr(n-1,n),0),e2=LP(Fr(n-1,n),-s),L=e2,R=Fr(zb);
  return{v,x:Fr(x),unit:'Kč',e:[e1,e2],L,R,
   text:`Na třídním účtu bylo ${v} Kč. Za autobus na výlet zaplatili ${w} této částky a za vstupenky do muzea ještě ${fmtNum(s)} Kč.`,
   q:[`Vyjádřete výrazem s proměnnou ${v}, kolik korun zbylo na účtu po zaplacení autobusu.`,`Vyjádřete výrazem s proměnnou ${v}, kolik korun zbylo na účtu nakonec.`,`Nakonec zbylo na účtu ${fmtNum(zb)} Kč. Vypočtěte, kolik korun bylo na účtu na začátku.`],
   kroky:[[`Autobus stál ${frBox(V(v),n)}, na účtu ${K('zbylo celé x bez této části')}.`,`${V(v)} ${MINUS} ${frBox(V(v),n)} = ${polyH(e1,v)}`],[`Pak zaplatili ještě ${fmtNum(s)} Kč.`,polyH(e2,v)]],
   uvod:`Nakonec zbylo ${fmtNum(zb)} Kč:`,
   chyby:[[{p:LP(Fr(1,n),0),rada:`${v}/${n} je cena autobusu. Na účtu zbylo ${v} − ${v}/${n}.`}],[{p:LP(Fr(1,n),-s),rada:`Po zaplacení autobusu zbylo ${v} − ${v}/${n}, od toho odečti vstupenky ${s} Kč.`},{p:LP(1,-s),rada:`Nezapomeň odečíst i autobus: ${v} − ${v}/${n} − ${s}.`}]]}}},
 {lv:2,f(){const v='x',n=pick([4,5,6]),m=pick([2,3]);if(n-1-m<1)return null;const w=ZLOMKY_SLOVY[n],k=ri(10,40),x=n*k,zb=(n-1-m)*k;const J=pick(JMENA.f);const e1=LP(Fr(m,n),0),e2=LP(Fr(n-1-m,n),0),L=e2,R=Fr(zb);
  return{v,x:Fr(x),unit:'stran',e:[e1,e2],L,R,
   text:`${J} čte knihu, která má ${v} stran. První týden přečetla ${w} knihy, druhý týden ${KRAT[m]} více stran než první týden.`,
   q:[`Vyjádřete výrazem s proměnnou ${v}, kolik stran přečetla druhý týden.`,`Vyjádřete výrazem s proměnnou ${v}, kolik stran jí ještě zbývá přečíst.`,`Zbývá jí přečíst ${zb} stran. Vypočtěte, kolik stran má kniha.`],
   kroky:[[`První týden přečetla ${frBox(V(v),n)}, druhý týden ${K(`${m}krát tolik`)}.`,`${m} · ${frBox(V(v),n)} = ${polyH(e1,v)}`],[`Zbývá ${K('celá kniha bez prvního i druhého týdne')}.`,`${V(v)} ${MINUS} ${frBox(V(v),n)} ${MINUS} ${polyH(e1,v)} = ${polyH(e2,v)}`]],
   uvod:`Zbývá jí ${zb} stran:`,
   chyby:[[{p:LP(Fr(m+1,n),0),rada:`${cap(KRAT[m])} více stran znamená ${m}·${v}/${n}, ne ${v}/${n} k tomu ještě přičítat.`}],[{p:LP(Fr(n-m,n),0),rada:`Zbývá kniha bez prvního i druhého týdne: ${v} − ${v}/${n} − ${m}${v}/${n}.`},{p:LP(Fr(n-1,n),0),rada:`Odečti oba týdny: ${v} − ${v}/${n} − ${m}${v}/${n}.`}]]}}}
];
