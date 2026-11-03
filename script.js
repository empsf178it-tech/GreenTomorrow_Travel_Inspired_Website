// GreenTomorrow interactions: reveal, counters, journey progress, marquee and story slider.
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible','in-view');
      if(entry.target.classList.contains('stat')) countUp(entry.target.querySelector('.counter'));
      observer.unobserve(entry.target);
    }
  });
},{threshold:.16});
document.querySelectorAll('.reveal,.stat,.journey-step').forEach(el=>observer.observe(el));
const journeyObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){document.querySelector('.journey-track')?.classList.add('active');journeyObserver.disconnect();}}),{threshold:.15});
const journey=document.querySelector('.journey-track');if(journey)journeyObserver.observe(journey);
function countUp(el){if(!el||el.dataset.done)return;el.dataset.done='1';const target=Number(el.dataset.target)||0;const start=performance.now(),duration=1700;function frame(now){const p=Math.min((now-start)/duration,1),ease=1-Math.pow(1-p,4);el.textContent=Math.round(target*ease).toLocaleString('en-IN');if(p<1)requestAnimationFrame(frame);}requestAnimationFrame(frame);}
const menuBtn=document.querySelector('.menu-toggle'),nav=document.querySelector('.nav');
menuBtn?.addEventListener('click',(e)=>{
  e.stopPropagation();
  const open=nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded',String(open));
  menuBtn.setAttribute('aria-label',open?'Close menu':'Open menu');
});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  nav.classList.remove('open');
  menuBtn?.setAttribute('aria-expanded','false');
  menuBtn?.setAttribute('aria-label','Open menu');
}));
document.addEventListener('click',(e)=>{
  if(nav?.classList.contains('open')&&!nav.contains(e.target)&&!menuBtn?.contains(e.target)){
    nav.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded','false');
    menuBtn?.setAttribute('aria-label','Open menu');
  }
});
document.addEventListener('keydown',(e)=>{
  if(e.key==='Escape'&&nav?.classList.contains('open')){
    nav.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded','false');
    menuBtn?.setAttribute('aria-label','Open menu');
    menuBtn?.focus();
  }
});
const track=document.querySelector('.story-track');let storyIndex=0;
function moveStories(dir){
  if(!track)return;
  const cards=[...track.children];
  const visible=window.innerWidth<=700?1:window.innerWidth<=1024?2:3;
  const max=Math.max(0,cards.length-visible);
  storyIndex=Math.max(0,Math.min(max,storyIndex+dir));
  const gap=16;
  const width=cards[0].getBoundingClientRect().width;
  track.style.transform=`translateX(-${storyIndex*(width+gap)}px)`;
}
document.querySelector('.story-next')?.addEventListener('click',()=>moveStories(1));
document.querySelector('.story-prev')?.addEventListener('click',()=>moveStories(-1));
window.addEventListener('resize',()=>{
  if(window.innerWidth>1024&&nav?.classList.contains('open')){
    nav.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded','false');
    menuBtn?.setAttribute('aria-label','Open menu');
  }
  storyIndex=0;
  if(track)track.style.transform='translateX(0)';
});


// Premium interactions: page progress, subtle pointer depth, section parallax and active navigation.
const progressBar=document.querySelector('.page-progress span');
const headerEl=document.querySelector('.header');
function updateProgress(){
 const max=document.documentElement.scrollHeight-window.innerHeight;
 const pct=max>0?(window.scrollY/max)*100:0;
 if(progressBar)progressBar.style.width=pct+'%';
 if(headerEl)headerEl.classList.toggle('is-scrolled',window.scrollY>8);
}
window.addEventListener('scroll',updateProgress,{passive:true});updateProgress();

// Gentle image depth on desktop; disabled for touch/reduced-motion users.
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduceMotion && window.matchMedia('(pointer:fine)').matches){
 document.querySelectorAll('.program-card,.story-card').forEach(card=>{
  card.addEventListener('pointermove',e=>{
   const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
   card.style.transform=`translateY(-5px) perspective(900px) rotateX(${-y*2.2}deg) rotateY(${x*2.2}deg)`;
  });
  card.addEventListener('pointerleave',()=>{card.style.transform='';});
 });
}
const navSections=[...document.querySelectorAll('main section[id],footer[id]')];
const navLinks=[...document.querySelectorAll('.nav a[href^="#"]')];
const activeObserver=new IntersectionObserver(entries=>{
 entries.forEach(entry=>{
  if(entry.isIntersecting){
   navLinks.forEach(link=>link.classList.toggle('active-link',link.getAttribute('href')==='#'+entry.target.id));
  }
 });
},{rootMargin:'-35% 0px -55% 0px'});
navSections.forEach(section=>activeObserver.observe(section));

// A subtle reveal on section headings as each section enters the viewport.
const headingObserver=new IntersectionObserver(entries=>{
 entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add('heading-arrived');headingObserver.unobserve(entry.target);}
 });
},{threshold:.25});
document.querySelectorAll('section h2').forEach(h=>headingObserver.observe(h));


// Contact form: validate locally and open the visitor's email app with a prefilled enquiry.
const contactForm=document.querySelector('#green-contact-form');
contactForm?.addEventListener('submit',event=>{
 event.preventDefault();
 const status=contactForm.querySelector('.form-status');
 if(!contactForm.reportValidity())return;
 const data=new FormData(contactForm);
 const subject=encodeURIComponent('GreenTomorrow enquiry — '+data.get('interest'));
 const body=encodeURIComponent(
  'Name: '+data.get('name')+'\n'+
  'Email: '+data.get('email')+'\n'+
  'Phone: '+(data.get('phone')||'Not provided')+'\n'+
  'Interest: '+data.get('interest')+'\n\n'+
  'Message:\n'+data.get('message')
 );
 status.textContent='Opening your email app with your message. Please send it there to complete your enquiry.';
 status.classList.add('success');
 window.location.href='mailto:hello@greentomorrow.org?subject='+subject+'&body='+body;
});
