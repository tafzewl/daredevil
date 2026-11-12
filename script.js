const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
let audioEnabled = true, audioCtx = null, revealIndex = 0, fullLetter = false;

const letters = [
  {title:"01 — The Yellow Robe",text:"I remember the color before I remember the night. Yellow cloth, bright enough to believe the world could still be kind. I wore it like a promise I hadn't yet learned how to keep.",sign:"— M."},
  {title:"02 — The City",text:"This city has a thousand voices, Karen. A train shivering underground. A siren turning a corner. Someone laughing through a wall too thin to hold back the world. I learned to hear everything except what I needed to hear from you.",sign:"— M."},
  {title:"03 — The Silence",text:"People think silence is empty. It isn't. It is full of the words you rehearse too late, the apologies that never find a door, the small ordinary moments you would trade anything to hear again.",sign:"— M."},
  {title:"04 — St. Patrick's Cathedral",text:"Tonight, the candles tremble in the draft. I came here looking for an answer and found only the space where one might be. I will carry your name with me—not as a wound to worship, but as proof that I was lucky enough to love.",sign:"— M."}
];
const comics = {
 born:{title:"BORN AGAIN / THE ARCHITECTURE OF RUIN",essay:"Born Again turns a superhero story into a study of what remains when every external support is stripped away. Matt's faith is not a shield against suffering; it is the difficult question he must answer while suffering. The work's visual restraint makes each collapse feel intimate rather than spectacular.",panels:[
  ["01 / THE FALL","Composition: a small, isolated figure is swallowed by vertical city shapes. Dense blacks press inward while a narrow crimson accent keeps the eye trapped near the subject. The frame makes the city feel like an institution, not a home."],
  ["02 / THE BODY","Composition: close framing and compressed negative space make physical damage impossible to romanticize. Hard shadow cuts across the face; the absence of bright color denies the reader an easy heroic release."],
  ["03 / THE RETURN","Composition: the figure is finally given breathing room. A controlled line of light divides darkness rather than erasing it. The visual shift suggests endurance, not a clean or effortless victory."]
 ]},
 yellow:{title:"DAREDEVIL: YELLOW / THE COLOR OF REMEMBERING",essay:"Yellow is a love letter written after the chance to say everything has passed. Its warm palette does not make grief gentler; it makes memory more vivid, because tenderness and pain occupy the same frame. Matt's narration reveals a young hero trying to turn loss into language, and language into a way of continuing.",panels:[
  ["01 / THE LETTER","Composition: the page behaves like a private room, with handwritten space becoming the emotional center. Warm ochre suggests a memory held close, while the surrounding shadow keeps the present unresolved."],
  ["02 / THE YOUNG MASK","Composition: the masked figure is framed against a field of yellow, a color that feels exposed rather than invulnerable. Strong contour lines make the costume graphic and youthful; the pose carries hope before experience hardens it."],
  ["03 / THE ABSENCE","Composition: a second presence is suggested by empty space and a softened profile rather than action. The eye moves between what is visible and what is missing, echoing the letter's central tension: love survives, but its recipient is gone."]
 ]},
 out:{title:"OUT / WHEN THE MASK BECOMES PUBLIC",essay:"Out dismantles the safety of the secret identity. The story's tension comes from the collision of public spectacle and private consequence: Matt can no longer decide who gets to look at him, or what they believe they see. Its cool, documentary-like mood makes exposure feel less like a twist than a slow loss of control.",panels:[
  ["01 / THE WATCHERS","Composition: the central figure is boxed in by windows, witnesses, and hard architectural edges. Cool blue-gray tones flatten the scene into something almost journalistic; the crowd becomes a pressure system."],
  ["02 / THE INTERROGATION","Composition: a close, off-center crop refuses the comfort of a commanding hero pose. Heavy blacks and restrained highlights make each expression difficult to read, mirroring the story's uncertain boundary between truth and performance."],
  ["03 / THE STREET","Composition: rain and reflective surfaces fragment the silhouette. The city appears to watch back. Sparse color keeps the mood cold, while the figure's red is less a symbol of power than a mark that cannot be hidden."]
 ]},
 heaven:{title:"TO HEAVEN THROUGH HELL / THE COST OF MERCY",essay:"This era asks whether doing good is enough when good intentions still leave people hurt. Matt's vocation is inseparable from guilt, but guilt alone cannot repair anything. The story's spiritual weight comes from the slow distinction between punishment and accountability—and from the possibility that mercy must include the self.",panels:[
  ["01 / THE AFTERMATH","Composition: the hero is framed low against looming structures, emphasizing consequence over spectacle. Muted amber and deep shadow make the scene feel sacred and uneasy at once."],
  ["02 / THE THRESHOLD","Composition: a doorway or cathedral-like vertical divides the frame between darkness and pale light. Strong perspective turns a physical passage into a moral question: crossing over is not the same as being absolved."],
  ["03 / THE CHOICE","Composition: a still figure occupies a small portion of a wide panel. The surrounding negative space slows the eye, giving the decision room to matter. Warm highlights are earned, not triumphant."]
 ]}
};

function sound(type="click"){
  if(!audioEnabled) return;
  try{
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx)return;
    if(!audioCtx) audioCtx=new Ctx();
    if(audioCtx.state==="suspended") audioCtx.resume();
    const now=audioCtx.currentTime, osc=audioCtx.createOscillator(), gain=audioCtx.createGain();
    osc.connect(gain);gain.connect(audioCtx.destination);
    if(type==="ping"){osc.type="sine";osc.frequency.setValueAtTime(760,now);osc.frequency.exponentialRampToValueAtTime(260,now+.24);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.12,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+.3);osc.start(now);osc.stop(now+.31);}
    else if(type==="braille"){osc.type="sine";osc.frequency.setValueAtTime(115,now);gain.gain.setValueAtTime(.0001,now);gain.gain.linearRampToValueAtTime(.045,now+.004);gain.gain.exponentialRampToValueAtTime(.0001,now+.06);osc.start(now);osc.stop(now+.065);}
    else{osc.type="triangle";osc.frequency.setValueAtTime(1300+Math.random()*300,now);gain.gain.setValueAtTime(.0001,now);gain.gain.linearRampToValueAtTime(.035,now+.002);gain.gain.exponentialRampToValueAtTime(.0001,now+.025);osc.start(now);osc.stop(now+.03);}
  }catch(e){}
}
function setAudio(on){
  audioEnabled=on;
  ["#audioToggle","#audioInline"].forEach(sel=>{const b=$(sel);b.classList.toggle("on",on);b.setAttribute("aria-pressed",String(on));});
  $("#audioStatus").textContent=on?"ON":"OFF";
  if(on)sound("braille");
}
$("#audioToggle").addEventListener("click",()=>setAudio(!audioEnabled));
$("#audioInline").addEventListener("click",()=>setAudio(!audioEnabled));

function showChapter(i){
  revealIndex=i;fullLetter=false;
  $$(".chapter").forEach((b,n)=>{b.classList.toggle("active",n===i);b.setAttribute("aria-selected",String(n===i));});
  $("#letterChapterTitle").textContent=letters[i].title;
  $("#letterText").textContent=letters[i].text;
  $("#letterSignoff").textContent=letters[i].sign;
  $("#unfoldBtn").innerHTML=(i===letters.length-1?"RETURN TO FIRST":"UNFOLD NEXT")+" <span>→</span>";
}
$$(".chapter").forEach(b=>b.addEventListener("click",()=>{sound("braille");showChapter(Number(b.dataset.chapter));}));
$("#unfoldBtn").addEventListener("click",()=>{
  sound("click");
  if(fullLetter){showChapter(0);return;}
  if(revealIndex<letters.length-1)showChapter(revealIndex+1);else showChapter(0);
});
$("#revealAll").addEventListener("click",()=>{
  sound("braille");fullLetter=true;
  $$(".chapter").forEach(b=>{b.classList.remove("active");b.setAttribute("aria-selected","false");});
  $("#letterChapterTitle").textContent="THE COMPLETE MANUSCRIPT";
  $("#letterText").textContent=letters.map(x=>x.text).join("  \u2736  ");
  $("#letterSignoff").textContent="— M.";
  $("#unfoldBtn").innerHTML="START AGAIN <span>→</span>";
});

$$("[data-open]").forEach(b=>b.addEventListener("click",()=>{
  const d=comics[b.dataset.open];$("#detailTitle").textContent=d.title;$("#detailEssay").textContent=d.essay;
  $("#panelNotes").innerHTML=d.panels.map(p=>`<article class="panel-note"><b>${p[0]}</b><p>${p[1]}</p></article>`).join("");
  $("#comicDetail").hidden=false;$("#comicDetail").scrollIntoView({behavior:"smooth",block:"nearest"});sound("click");
}));
$("#closeDetail").addEventListener("click",()=>$("#comicDetail").hidden=true);

const timelineCopy=[
"Frank Miller's run pushed Daredevil toward street-level noir, moral ambiguity, and the cost of living by a code.",
"Born Again dismantled Matt's life and rebuilt the hero around endurance, faith, and a stubborn refusal to surrender his humanity.",
"Daredevil: Yellow looks back through love and loss, using the early yellow suit as a frame for memory and mourning.",
"Out turns Matt's secret identity into public knowledge and explores what happens when private life becomes public property.",
"To Heaven Through Hell examines guilt, responsibility, vocation, and the difficult work of choosing to do better.",
"The legacy continues through new creative teams, reimaginings, and the same enduring conflict between justice and vengeance."
];
$$(".time-point").forEach(b=>b.addEventListener("click",()=>{
  $$(".time-point").forEach(x=>x.classList.remove("active"));b.classList.add("active");
  $("#timelineDetail").textContent=timelineCopy[Number(b.dataset.time)];sound("click");
}));

let pingTimer;
$("#pingBtn").addEventListener("click",()=>{
  sound("ping");const panel=$("#radar");panel.classList.add("pinging");$("#echoValue").textContent="PING SENT";
  clearTimeout(pingTimer);pingTimer=setTimeout(()=>{panel.classList.remove("pinging");$("#echoValue").textContent="ACTIVE";},900);
});
$$(".cal").forEach(b=>b.addEventListener("click",()=>{
  $$(".cal").forEach(x=>x.classList.remove("active"));b.classList.add("active");
  const screen=$(".radar-screen");screen.style.opacity="1";
  if(b.dataset.layer==="heart"){screen.style.filter="hue-rotate(0deg)";$("#bpm").innerHTML="72 <small>BPM</small>";}
  if(b.dataset.layer==="echo"){screen.style.filter="hue-rotate(18deg)";$("#echoValue").textContent="ACTIVE";sound("ping");}
  if(b.dataset.layer==="baro"){screen.style.filter="hue-rotate(-12deg)";$("#pressure").innerHTML="1013 <small>hPa</small>";}
}));
const menu=$(".menu-toggle");
menu.addEventListener("click",()=>{const nav=$(".nav-links"),open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));menu.textContent=open?"×":"☰";});
$$(".nav-links a").forEach(a=>a.addEventListener("click",()=>{$(".nav-links").classList.remove("open");menu.setAttribute("aria-expanded","false");menu.textContent="☰";}));
showChapter(0);
// The DD monogram is the Home / back-to-top control.
$(".monogram").addEventListener("click", (event) => { event.preventDefault(); window.scrollTo({top: 0, behavior: "smooth"}); });
