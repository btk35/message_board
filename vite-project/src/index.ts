import DOMPurify from 'dompurify'

export const index =()=>{
  
let nickname:HTMLInputElement |null
let message:HTMLInputElement |null
let table:HTMLTableElement |null
const url = import.meta.env.VITE_FIREBASE_DATABASE_URL;

let lastPostTime = 0
const POST_INTERVAL = 10000

function doAction():void {
  const now = Date.now();
  const data = {
    nickname: nickname?.value,
    message: message?.value,
    posted: new Date().getTime()
  }
  if (now - lastPostTime < POST_INTERVAL) {
    alert("連続投稿は10秒後にもう一度試してください");
    return;
  }
  if (!message?.value.trim()) {
    alert("空のメッセージは投稿できません");
    return;
  }
  sendData(url,data)
  lastPostTime = now;
}

function doDelete():void {
  const confirmDelete = confirm('本当にすべて消しますか？')
    if(!confirmDelete) return;
  fetch(url,{
    method:'DELETE'
  }).then(res =>{
    console.log(res.statusText)
    getData(url)
  })
}
function sendData(url:string, data:object) {
  fetch(url,{
    method:'POST',
    mode:'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(res=>{
    console.log(res.statusText)
    getData(url)
  })
}

function getData(url:string) {
  fetch(url).then(res =>res.json()).then(re=> {
    let result = `<thead>
        <tr>
          <th>Message</th>
          <th>Nickname</th>
          <th>posted</th>
        </tr>
        </thead>
        <tbody>`
    let tb= ''
    for (let ky in re) {
      let item = re[ky]
      tb = '<tr><td>'+ item['message'] + '</td><td>'
      +item['nickname'] + '</td><td>'
      +new Date(item['posted']).toLocaleString()
      +'</td></tr>' +tb
    }
    result += tb + '</tbody>'
    if (table) {
      console.log(table)
      table.innerHTML = DOMPurify.sanitize(result);
    }
  })
}
window.addEventListener('load',()=> {
  message = document.querySelector('#message')
  nickname = document.querySelector('#nickname')
  table = document.querySelector('#table')
  const btn= document.querySelector('#btn') as HTMLButtonElement | null;
  if(!btn){
    console.error("btnがnull")
    return;
  }
  btn.onclick = doAction
  const del = document.querySelector('#delete') as HTMLButtonElement | null;
  if(!del){
    console.error("no sentence")
    return;
  }
  del.onclick = doDelete
  getData(url)
})
}