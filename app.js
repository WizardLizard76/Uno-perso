const socket=io(); let state=null, room=null;
const COLORS={red:'Rouge',yellow:'Jaune',green:'Vert',blue:'Bleu',black:'Noire'};
function $(id){return document.getElementById(id)}
function nameVal(){return $('name').value.trim()||'Joueur'}
function createRoom(){socket.emit('createRoom',{name:nameVal()})}
function joinRoom(){socket.emit('joinRoom',{room:$('roomInput').value.trim().toUpperCase(),name:nameVal()})}
function startGame(){socket.emit('startGame',{room})} function nextRound(){socket.emit('nextRound',{room})}
function draw(){socket.emit('draw',{room})} function endTurn(){socket.emit('endTurn',{room})} function uno(){socket.emit('uno',{room})} function unoFault(){socket.emit('unoFault',{room})}
function play(id){let color=null; const c=state.hand.find(x=>x.id===id); if(c&&c.c==='black') color=pickColor(); socket.emit('playCard',{room,cardId:id,color})}
function pickColor(){const v=prompt('Couleur : rouge, jaune, vert ou bleu','rouge')||'rouge';return ({rouge:'red',jaune:'yellow',vert:'green',bleu:'blue',red:'red',yellow:'yellow',green:'green',blue:'blue'})[v.toLowerCase()]||'red'}
function intercept(){socket.emit('intercept',{room})}
function copyLink(){navigator.clipboard?.writeText(location.origin+'?room='+room); alert('Lien copié : '+location.origin+'?room='+room)}
function same(a,b){return a&&b&&a.c===b.c&&a.v===b.v}
function canPlay(card){if(state.pendingDraw>0){if(state.pendingMode==='+4')return card.type==='+4';return card.type==='+2'||card.type==='+4'} if(card.c==='black')return true; return state.topCard&& (card.c===state.topCard.c||card.v===state.topCard.v)}
function label(c){return c?(COLORS[c.c]||c.c)+' '+c.v:''}
function card(c,click='',playable=false,small=false){return `<div class="card ${c.c} ${playable?'playable':''} ${small?'small':''}" ${click}><span class="corner">${c.v}</span>${c.v}<span class="corner2">${c.v}</span></div>`}
socket.on('joined',d=>{room=d.room; $('home').classList.add('hidden'); $('game').classList.remove('hidden'); $('roomCode').textContent=room; $('roomBadge').textContent='Salle '+room; history.replaceState(null,'','?room='+room)})
socket.on('errorMsg',m=>{alert(m); $('homeMsg').textContent=m})
socket.on('state',s=>{state=s; room=s.room; render()})
function render(){ if(!state)return; const me=state.players.find(p=>p.id===state.myId); $('startBtn').disabled=state.myId!==state.hostId||state.started; $('nextBtn').disabled=state.myId!==state.hostId||!state.roundOver;
$('players').innerHTML=state.players.map(p=>`<div class="player ${p.active?'active':''}"><b>${p.name}</b> ${p.id===state.myId?'(toi)':''}<br><span class="muted">${p.cards} cartes ${p.connected?'':'· déconnecté'}</span><br><span class="score">${p.score} pts</span>${p.saidUno?' · UNO':''}</div>`).join('');
$('topCard').innerHTML=state.topCard?card(state.topCard):'<span class="muted">En attente</span>'; $('turn').innerHTML=state.roundOver?'<b class="good">Manche terminée</b>':'Tour : <b>'+(state.players.find(p=>p.active)?.name||'-')+'</b>'; $('pending').textContent=state.pendingDraw?`Pénalité en cours : +${state.pendingDraw} (${state.pendingMode})`:'Aucune pénalité'; $('direction').textContent='Sens : '+(state.direction===1?'horaire':'anti-horaire');
$('hand').innerHTML=state.hand.map(c=>card(c,`onclick="play('${c.id}')"`,canPlay(c))).join('')||'<span class="muted">Tu n’as pas encore de cartes.</span>';
let canInt=state.hand.some(c=>same(c,state.lastCard)); $('intercepts').innerHTML=canInt?`<button onclick="intercept()">Intercepter avec ta carte identique</button><p class="muted">Dernière carte : ${label(state.lastCard)}</p>`:'<span class="muted">Aucune interception possible pour toi.</span>';
$('log').innerHTML=state.log.map(x=>'<div>• '+x+'</div>').join(''); }
const params=new URLSearchParams(location.search); if(params.get('room')) $('roomInput').value=params.get('room').toUpperCase();
