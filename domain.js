export const defaults=[['Жим лёжа','Грудь'],['Приседания','Ноги'],['Становая тяга','Спина'],['Подтягивания','Спина'],['Жим гантелей','Грудь'],['Тяга верхнего блока','Спина'],['Жим над головой','Плечи'],['Сгибание рук','Руки'],['Разгибание рук','Руки'],['Отжимания','Грудь'],['Выпады','Ноги'],['Планка','Кор']].map(([name,group],i)=>({id:'ex'+i,name,group,mode:name==='Планка'?'time':'reps'}));
export const fresh=()=>({version:1,exercises:structuredClone(defaults),workouts:[],active:null,rest:90,timerEnd:null});
export const uid=()=>crypto.randomUUID();
export const validSet=(s,mode='reps')=>Number.isFinite(Number(s.weight))&&Number(s.weight)>=0&&Number(s.weight)<=2000&&Number.isFinite(Number(s.reps))&&Number(s.reps)>0&&Number(s.reps)<=10000&&(mode==='time'||Number.isInteger(Number(s.reps)));
export const completeSets=w=>w.exercises.flatMap(e=>e.sets.filter(s=>s.done&&validSet(s,e.mode)));
export const volume=w=>w.exercises.filter(e=>e.mode!=='time').flatMap(e=>e.sets.filter(s=>s.done&&validSet(s))).reduce((n,s)=>n+Number(s.weight)*Number(s.reps),0);
export const historyFor=(data,id)=>data.workouts.filter(w=>w.exercises.some(e=>e.exerciseId===id&&e.sets.some(s=>s.done))).sort((a,b)=>a.startedAt-b.startedAt);
export function validate(data){
 if(!data||data.version!==1||!Array.isArray(data.exercises)||!Array.isArray(data.workouts)||data.exercises.length>2000||data.workouts.length>20000)throw Error('Файл не похож на резервную копию GymNotes.');
 const str=(v,n=200)=>typeof v==='string'&&v.length<=n;
 const unique=a=>new Set(a).size===a.length;
 if(!unique(data.exercises.map(e=>e.id))||data.exercises.some(e=>!str(e.id)||!str(e.name)||!e.name.trim()||!str(e.group)||!['reps','time'].includes(e.mode)))throw Error('Некорректный список упражнений.');
 const ids=new Set(data.exercises.map(e=>e.id));
 const check=w=>{if(!w||!str(w.id)||!str(w.name)||!str(w.note,5000)||!Number.isFinite(w.startedAt)||w.startedAt<0||!Number.isFinite(new Date(w.startedAt).getTime())||!Array.isArray(w.exercises)||w.exercises.length>200)throw Error('Некорректная тренировка.');if(!unique(w.exercises.map(e=>e.id)))throw Error('Повторяющиеся упражнения.');for(const e of w.exercises){if(!str(e.id)||!ids.has(e.exerciseId)||!str(e.name)||!['reps','time'].includes(e.mode)||!str(e.note,5000)||!Array.isArray(e.sets)||e.sets.length>200)throw Error('Некорректное упражнение.');for(const s of e.sets){if(typeof s.done!=='boolean'||!['string','number'].includes(typeof s.weight)||!['string','number'].includes(typeof s.reps)||String(s.weight).length>20||String(s.reps).length>20||(s.done&&!validSet(s,e.mode)))throw Error('Некорректный подход.');}}};
 if(!unique(data.workouts.map(w=>w.id)))throw Error('Повторяющиеся тренировки.');
 data.workouts.forEach(w=>{check(w);if(!Number.isFinite(w.endedAt)||w.endedAt<w.startedAt||!completeSets(w).length)throw Error('Некорректная завершённая тренировка.');});if(data.active){check(data.active);if(data.workouts.some(w=>w.id===data.active.id))throw Error('Повторяющаяся тренировка.');}
 if(!Number.isFinite(data.rest)||data.rest<15||data.rest>600)throw Error('Некорректное время отдыха.');if(data.timerEnd!==null&&(!Number.isFinite(data.timerEnd)||data.timerEnd<0))throw Error('Некорректный таймер.');return data;
}
