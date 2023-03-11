var table = document.querySelector("table");
//服务端同样将id返回
var json = []
//单页条数
var pageNum = 7;
//总页数
var totalPages;

var pagethis = 1;
var pre;
var next;

//doctype value
var doctype = 0;

//select mutiple
var selected = [];

function clearTable() {
    var tbody = document.querySelector("tbody");
    tbody.innerHTML = ``;
}

function formatContentType(contentType) {
    let content_type = contentType;
    switch (content_type) {
        case 1:
            content_type = "SE";
            break;
        case 2:
            content_type = "Note";
            break;
        case 3:
            content_type = "Creation";
            break;
        default:
            content_type = "image";
            break
    }
    return content_type;
}

async function getJSON() {
    try {
        let response = await fetch('/api/managerList');
        json = await response.json();
        loadFirst();
        bindPreAndNext();
    } catch (e) {
        console.log(e);
    }
}

function renderTr(item) {
    var tr = document.createElement("tr");
    item.is_hidden = parseInt(item.is_hidden);
    let name = 'img';
    if(item.content_type > 0){
        name = 'content';
    }
    if (!item.contentType) {
        item.contentType = formatContentType(item.content_type);
    }
    let time = new Date(item.create_time);
    let options = {
        timeZone:'Asia/shanghai',
        weekday:'long',
        year:'numeric',
        month:'long',
        day:'numeric'
    }
    let localTime = time.toLocaleDateString('zh-CN',options);
    tr.innerHTML = `
            <td><input class="select-radio" type="radio" value="${name==='content'?item.id:item.id + 1000}"></td>
            <td>${item.contentType}</td>
            <td>${item.name}</td>
            <td>${localTime}</td>
            <td>${item.section}</td>
            <td>${(function(){
                if(item.is_hidden===-1){
                    return "Del";
                }else if(item.is_hidden === 1){
                    return "Yes";
                }else{
                    return "No"
                }
            })()}</td>`;
    return tr;
}

function loadFirst() {
    clearTable();
    var tbody = document.querySelector("tbody");
    //加载第一页
    json.forEach((item, index) => {
        if (index < pageNum) {
            // var tr = document.createElement("tr");
            // item.is_hidden = parseInt(item.is_hidden);
            // item.content_type = formatContentType(item.content_type);
            // tr.innerHTML = `
            // <td><input type="radio" value="${item.id}"></td>
            // <td>${item.content_type}</td>
            // <td>${item.name}</td>
            // <td>${item.create_time}</td>
            // <td>${item.section}</td>
            // <td>${item.is_hidden ? "Yes" : "No"}</td>`;
            var tr = renderTr(item);
            tbody.appendChild(tr);
        }
    });
    //计算总页数
    var len = json.length;
    totalPages = len % pageNum == 0 ? len / pageNum : Math.floor(len / pageNum) + 1;
    //绑定radio
    bindRadio();
}

function bindPreAndNext() {
    //添加前后翻页
    pre = document.querySelector("#pre");
    next = document.querySelector("#next");
    pre.onclick = function () {
        if (pagethis == 1) return;
        //获取start 和 end, 下标
        pagethis--;
        let start = (pagethis - 1) * pageNum;
        let end = start + pageNum - 1;
        clearTable();
        let showData = json.filter((item, index) => {
            return (index >= start) && (index <= end);
        });
        console.log(start, end, showData);
        var tbody = document.querySelector("tbody");
        showData.forEach((item) => {
            //     var tr = document.createElement("tr");
            //     item.is_hidden = parseInt(item.is_hidden);
            //     item.content_type = formatContentType(item.content_type);
            //     tr.innerHTML = `
            // <td>${item.id + 1}</td>
            // <td>${item.content_type}</td>
            // <td>${item.name}</td>
            // <td>${item.create_time}</td>
            // <td>${item.section}</td>
            // <td>${item.is_hidden ? "Yes" : "No"}</td>`;
            var tr = renderTr(item);
            tbody.appendChild(tr);
        });
        //绑定radio
        bindRadio();
    };
    next.onclick = function () {
        if (pagethis == totalPages) return;
        console.log(pagethis, totalPages)
        //获取start end下标
        pagethis++;
        let start = (pagethis - 1) * pageNum;
        let end = start + pageNum > json.length - 1 ? json.length - 1 : start + pageNum - 1;
        let showData = json.filter((item, index) => {
            return (index >= start) && (index <= end);
        });
        console.log(start, end, showData);
        clearTable();
        var tbody = document.querySelector("tbody");
        showData.forEach((item, index) => {
            //     var tr = document.createElement("tr");
            //     item.is_hidden = parseInt(item.is_hidden);
            //     item.content_type = formatContentType(item.content_type);
            //     tr.innerHTML = `
            // <td>${item.id + 1}</td>
            // <td>${item.content_type}</td>
            // <td>${item.name}</td>
            // <td>${item.create_time}</td>
            // <td>${item.section}</td>
            // <td>${item.is_hidden ? "Yes" : "No"}</td>`;
            var tr = renderTr(item);
            tbody.appendChild(tr);
        });
        //不足7, 补足不可见的元素
        if (end % 7 !== 6) {
            let remainNum = 6 - end % 7;
            console.log(remainNum);
            let invisibleTr = document.createElement('tr');
            invisibleTr.style.visibility = 'hidden';
            invisibleTr.innerHTML = `
            <td>1</td>`;
            for (let i = 1; i <= remainNum; i++) {
                tbody.appendChild(invisibleTr.cloneNode(true));
            }
        }
        //绑定radio
        bindRadio();

    }
}

function changeDocType() {
    console.log("change");
    var docContent = document.getElementById('doc-content');
    var doc = document.getElementById('doc');
    var labelName = document.getElementById('label-name');
    var labels = document.getElementById('labels');
    if (doctype === 0) {//document to image 文件内容 选择文件 文件名 文件描述
        docContent.innerHTML = '<option value="5" selected>image</option>';
        doc.setAttribute('accept', '.png');
        labelName.childNodes[0].data = '图片描述';
        labels.setAttribute('placeholder', 'description');
        doctype = 1;
    } else {//image to document
        docContent.innerHTML = `
        <option value="1" selected>se</option>
        <option value="2">note</option>
        <option value="3">creation</option>`;
        doc.setAttribute('accept', '.md');
        labelName.childNodes[0].data = '文件标签';
        labels.setAttribute('placeholder', '@ separate');
        doctype = 0;
    }
}

//绑定上传doc
function bindUpload() {
    var uploadForm = document.getElementById('upload-root');
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(uploadForm);
        if (formData.get('fileName') === '') {
            let name = formData.get('file').name;
            if(name.indexOf('.png')===-1){
                name = name.slice(0, -3);
            }else{
                name = name.slice(0,-4);
            }
            formData.set('fileName', name);
        }
        fetch('/api/admin/docupload', {
            method: 'POST',
            body: formData
        }).then(res => {
            return res.json();
        }).then(data => {
            if(data.code === 'ok'){
                var uploadbox = document.getElementById('shadow-box');
                uploadbox.style.display = 'none';
                alert('上传成功!');
            }
        }).catch(err => {
            console.log(err);
        })
    });
}

//@bug 只能单页面多选
function bindRadio() {
    selected = [];
    let radios = document.getElementsByClassName("select-radio");
    for (let i = 0; i < radios.length; i++) {
        radios[i].onclick = () => {
            if (radios[i].checked && selected.indexOf(radios[i].value) == -1) {
                selected.push(radios[i].value);
                console.log(selected);
                // selected.splice(selected.indexOf(radios[i].value),1);
            } else {
                radios[i].checked = false;
                selected.splice(selected.indexOf(radios[i].value), 1);
                console.log(selected);
            }
        }
    }
}

//绑定delete和is_hidden
function bindDelete() {
    let deleteFile = document.querySelector('#delete');
    deleteFile.addEventListener('click', (e)=>{
        alert('即将删除！');
        console.log(selected);
        fetch('/api/admin/delete',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify(selected)
        }).then(res=>{
            return res.json();
        }).then(data=>{
            if(data.state === 'ok'){
                window.location.reload(true);
            }
        }).catch(err=>{
            console.log(err);
        });
    })
}

function bindHidden() {
    let hiddenFile = document.querySelector('#hidden');
    hiddenFile.addEventListener('click',(e)=>{
        alert('即将隐藏！');
        console.log(selected);
        fetch('/api/admin/hidden',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify(selected)
        }).then(res=>{
            return res.json();
        }).then(data=>{
            if(data.state === 'ok'){
                window.location.reload(true);
            }
        }).catch(err=>{
            console.log(err);
        });
    })
}

function bindShow(){
    let hiddenFile = document.querySelector('#show-file');
    hiddenFile.addEventListener('click',(e)=>{
        alert('即将展示！');
        console.log(selected);
        fetch('/api/admin/show',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify(selected)
        }).then(res=>{
            return res.json();
        }).then(data=>{
            if(data.state === 'ok'){
                window.location.reload(true);
            }
        }).catch(err=>{
            console.log(err);
        });
    })
}

window.onload = function () {
    getJSON();
    //绑定遮罩层
    var upload = document.getElementById('upload');
    var uploadbox = document.getElementById('shadow-box');
    upload.addEventListener('click', (e) => {
        uploadbox.style.display = 'flex';
    })
    var cancelbox = document.querySelector('.cancel');
    cancelbox.addEventListener('click', (e) => {
        console.log('Cancel');
        uploadbox.style.display = 'none';
    })
    //绑定提交、删除、隐藏、展示
    bindUpload();
    bindDelete();
    bindHidden();
    bindShow();
};