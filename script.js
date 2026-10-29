var KAT=["Dompet","Elektronik","Kunci","Tas","Dokumen/KTM","Pakaian","Lainnya"];
var LOK=["Perpustakaan","Gedung Fransiskus Asisi","Gedung Lorenzo Bridinsi","Gedung Santa Clara","Gedung Leopold Mandic","Parkiran"];
var STOP=["yang","dan","di","ke","dari","ada","itu","ini","saya","warna","dengan","untuk","a","the"];
function iso(d){var x=new Date();x.setDate(x.getDate()-d);return x.toISOString().slice(0,10)}
var data=[
 {id:1,tipe:"ditemukan",nama:"Dompet kulit hitam",kat:"Dompet",lok:"Gedung Lorenzo Bridinsi",tgl:iso(1),des:"Dompet hitam berisi KTM dan kartu ATM, ditemukan di area parkiran",kon:"0812-1111-2222"},
 {id:2,tipe:"ditemukan",nama:"Kunci motor Honda",kat:"Kunci",lok:"Gedung Fransiskus Asisi",tgl:iso(2),des:"Kunci motor dengan gantungan beruang biru",kon:"0813-3333-4444"},
 {id:3,tipe:"ditemukan",nama:"Laptop ASUS abu-abu",kat:"Elektronik",lok:"Perpustakaan",tgl:iso(0),des:"Laptop asus abu-abu beserta charger",kon:"0857-5555-6666"},
 {id:4,tipe:"hilang",nama:"Tas ransel navy",kat:"Tas",lok:"Gedung Leopold Mandic",tgl:iso(3),des:"Ransel biru navy merek Eiger ditemukan di kelas 6.3",kon:"0821-7777-8888"},
 {id:5,tipe:"ditemukan",nama:"KTM atas nama Rina",kat:"Dokumen/KTM",lok:"Gedung Leopold Mandic",tgl:iso(1),des:"Kartu tanda mahasiswa jatuh di depan ruang dosen",kon:"0878-9999-0000"},
 {id:6,tipe:"hilang",nama:"Earphone putih",kat:"Elektronik",lok:"Perpustakaan",tgl:iso(2),des:"Earphone bluetooth putih dengan case kecil",kon:"0896-1212-3434"}
];
var $=function(i){return document.getElementById(i)};
function opts(el,arr,all){el.innerHTML=(all?'<option value="">Semua</option>':'')+arr.map(function(x){return'<option>'+x+'</option>'}).join('')}
opts($("fc"),KAT,1);opts($("fl"),LOK,1);opts($("kat"),KAT);opts($("lok"),LOK);
$("tgl").value=iso(0);

function tok(s){return (s||"").toLowerCase().replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter(function(w){return w.length>2&&STOP.indexOf(w)<0})}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}

//Simple recommendation: content-based scoring (teks 50, kategori 20, lokasi 20, tanggal 10) */
function skor(a,b){
  var ta=tok(a.nama+" "+a.des),tb=tok(b.nama+" "+b.des),n=0,alasan=[];
  ta.forEach(function(w){if(tb.indexOf(w)>=0)n++});
  var t=ta.length&&tb.length?n/Math.min(ta.length,tb.length):0;
  var s=Math.min(t,1)*50;
  if(n)alasan.push(n+" kata kunci cocok");
  if(a.kat&&a.kat===b.kat){s+=20;alasan.push("kategori sama")}
  if(a.lok&&a.lok===b.lok){s+=20;alasan.push("lokasi sama")}
  if(a.tgl&&b.tgl){var d=Math.abs(new Date(a.tgl)-new Date(b.tgl))/864e5;if(d<=7){s+=10*(1-d/7);alasan.push("tanggal berdekatan")}}
  return{s:Math.round(s),alasan:alasan};
}

function kartu(it,sk){
  return'<div class="card item">'+(sk?'<span class="score">'+sk.s+'%</span>':'')+
  '<span class="tag '+it.tipe+'">'+it.tipe+'</span><span class="meta">'+esc(it.kat)+'</span>'+
  '<h3>'+esc(it.nama)+'</h3><div>'+esc(it.des)+'</div>'+
  '<div class="meta">'+esc(it.lok)+' · '+esc(it.tgl)+' · Kontak: '+esc(it.kon||"-")+'</div>'+
  (sk?'<div class="bar"><i style="width:'+sk.s+'%"></i></div><div class="why">'+(sk.alasan.join(", ")||"kemiripan rendah")+'</div>':'')+'</div>';
}
function cari(){
  var q=$("q").value.trim(),c=$("fc").value,l=$("fl").value;
  var ref={nama:q,des:"",kat:c,lok:l,tgl:iso(0)};
  var hasil=data.filter(function(i){return i.tipe==="ditemukan"&&(!c||i.kat===c)&&(!l||i.lok===l)}).map(function(i){
    var sk=q?skor(ref,i):{s:0,alasan:[]};
    if(!q){sk=null}
    return{i:i,sk:sk};
  }).filter(function(r){return !q||r.sk.s>0});
  if(q)hasil.sort(function(a,b){return b.sk.s-a.sk.s});
  $("hasil").innerHTML=hasil.length?'<h2>Barang ditemukan'+(q?' (urut kemiripan)':'')+'</h2>'+hasil.map(function(r){return kartu(r.i,r.sk)}).join(''):'<div class="empty">Belum ada yang cocok. Coba laporkan barangmu di tab Lapor.</div>';
}
["q","fc","fl"].forEach(function(id){$(id).addEventListener("input",cari)});

function semua(){$("daftar").innerHTML=data.slice().reverse().map(function(i){return kartu(i)}).join('')}

$("kirim").onclick=function(){
  var nama=$("nama").value.trim();
  if(!nama){alert("Nama barang wajib diisi");return}
  var it={id:Date.now(),tipe:$("tipe").value,nama:nama,kat:$("kat").value,lok:$("lok").value,tgl:$("tgl").value,des:$("des").value,kon:$("kon").value};
  data.push(it);
  var lawan=it.tipe==="hilang"?"ditemukan":"hilang";
  var r=data.filter(function(x){return x.tipe===lawan&&x.id!==it.id}).map(function(x){return{i:x,sk:skor(it,x)}}).filter(function(r){return r.sk.s>=20}).sort(function(a,b){return b.sk.s-a.sk.s}).slice(0,3);
  $("rekom").innerHTML='<h2>Laporan terkirim ✓</h2>'+(r.length?'<p class="sub">Rekomendasi barang yang mungkin cocok:</p>'+r.map(function(x){return kartu(x.i,x.sk)}).join(''):'<div class="empty">Belum ada barang yang cocok saat ini. Kami akan tampilkan jika ada laporan baru.</div>');
  $("nama").value="";$("des").value="";cari();semua();
};

document.querySelectorAll(".tabs button").forEach(function(b){b.onclick=function(){
  document.querySelectorAll(".tabs button").forEach(function(x){x.classList.toggle("on",x===b)});
  ["cari","lapor","semua"].forEach(function(s){$(s).classList.toggle("hide",s!==b.dataset.t)});
}});
cari();semua();