//全局对象以节流
var allContentList = [];
var SEList = [];
var notesList = [];
var creationsList = [];
//跟踪当前页面 0 Search, 1 SE, 2 Notes, Creations 3, AI 4
var pageIndex = 0;

function toSearchContent(){
    alert('暂未完成~');
}

function toGetSEList(){
    // let data = await xhrRequest({
    //     type:"GET",
    //     url:"/file/fileList",
    //     isAsyn:true,
    //     contentType:0
    // });
    // console.log(data);
    getAndShow(1, SEList);
}

function toGetNotesList(){
    getAndShow(2, notesList);
}
function toGetCreationsList(){
    getAndShow(3, creationsList);
}

function talkToAI(){
    alert('暂未完成~');
}

//渲染List
function showList(data, main){
    //doc data: content_type create_time id name path section
    // img data : name create_time id path description
    let imgResults = [];
    if(data.imgResults){
        imgResults = data.imgResults;
        data = data.fileResults;
    }
    let showData = []
    if(typeof data[0].section === "string"){
        showData = data.map((element) => {
            element.create_time = formatTimeZone(element.create_time);
            // var date = new Date(element.create_time);
            // var options = {
            //     timeZone:'Asia/shanghai',
            //     weekday:'long',
            //     year:'numeric',
            //     month:'long',
            //     day:'numeric'
            // };
            // element.create_time = date.toLocaleDateString("zh-CN", options);
            if(element.section.indexOf('@') >= 0){
                element.section = element.section.split('@');
            }
            return element;
        });
        Object.assign(data, showData);
    }else{
        showData = data;
    }
    //控制页面
    main.style.backgroundImage = 'none';
    main.classList.add('main-showList');
    if(imgResults.length > 0){
        let separator = document.createElement('div');
        separator.style.backgroundColor = 'lightblue';
        separator.innerHTML = '-----Articles-----';
    }
    showData.forEach((element, index) => {
        let div = document.createElement('div');
        let section = ``
        if(element.section){
            let s = element.section;
            if(s instanceof Object){
                s.forEach((item,index)=>{
                    section +=`<div>${item}</div>`;
                });
            }else{
                section +=`<div>${s}</div>`;
            }
        }
        div.innerHTML = `
        <div class="article-index">${index + 1}</div>
        <div class="article-title">${element.name}</div>
        <div class="article-section">${section}</div>
        <div class="article-time">${element.create_time}</div>`;
        div.dataset.path = element.path;
        div.addEventListener("click", ()=>{
            let shadowBox = document.getElementById('shadow-box');
            let showContent = document.getElementById('show-box');
            let sideBar = document.getElementById('side-bar')
            showContent.style.width = (window.innerWidth - sideBar.clientWidth) + 'px';
            showContent.style.height = (window.innerHeight - 96) + 'px';
            //发送数据
            readDocRequest(element.name,element.path);
            shadowBox.style.display = 'flex';
        })
        main.appendChild(div);
    });
    //如果有图片
    if(imgResults.length > 0){
        let separator = document.createElement('div');
        separator.style.backgroundColor = 'lightblue';
        separator.innerHTML = '-----Images-----';
        main.appendChild(separator);
        imgResults.forEach((item,index)=>{
            index = index + showData.length;
            item.create_time = formatTimeZone(item.create_time);
            let div = document.createElement('div');
            div.innerHTML = `
            <div class="article-index">${index + 1}</div>
            <div class="article-title">${item.name}</div>
            <div class="article-time">${item.create_time}</div>`
            div.dataset.path = item.path;
            div.addEventListener('click',()=>{
                console.log(item.path);
            })
            main.appendChild(div);
        })
    }
}

async function getAndShow(contentType,list){
    if(list.length=== 0){
        console.log('get new!');
        Object.assign(list,await fetchRequest({
            type:'GET',
            url:"/api/fileList",
            init:{},
            contentType:contentType
        }));
    }
    //销毁原页面
    let main = document.getElementById('main');
    main.innerHTML = "";
    //转换页面和展示数据
    showList(list, main);
}

//@bug 应该过滤到图片路径
async function readDocRequest(filename,path){
    try{
        let rendererMD = new marked.Renderer();
        const res = await fetch('/api/file/readDoc',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
            },
            body:JSON.stringify({
                type:'doc',
                docpath:path
            })
        });
        const content = await res.text();
        let fileName = document.querySelector('#file-name');
        fileName.innerHTML = filename;
        marked.setOptions({
            renderer: rendererMD,
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: false,
            smartLists: true,
            smartypants: false,
            highlight: function (code) {
              return hljs.highlightAuto(code).value;
            }
          });
        let contentBox = document.querySelector('.content-box');
        contentBox.innerHTML = marked.parse(content);
        contentBox.scrollTop = 0;
        document.querySelectorAll('code').forEach(function (el) {
            //缺少这个类代码块没有背景
            el.classList.add('hljs')
        })
    }catch(e){
        console.log(e,e.json());
    }
}

function formatTimeZone(time){
    var date = new Date(time);
    var options = {
        timeZone:'Asia/shanghai',
        weekday:'long',
        year:'numeric',
        month:'long',
        day:'numeric'
    };
    return date.toLocaleDateString("zh-CN", options);
}