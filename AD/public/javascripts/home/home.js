var navLocation = -1;
function getContentList(number){
    number = parseInt(number);
    switch(number){
        case 0:
            toSearchContent();
            break;
        case 1:
            toGetSEList();
            break;
        case 2:
            toGetNotesList();
            break;
        case 3:
            toGetCreationsList();
            break;
        case 4:
            talkToAI();
            break;
        default:
            return "Error";
    }
    return "Ok";
}

function bindNav(){
    let navUl = document.getElementById("nav-ul");
    navUl.addEventListener("click",async (event)=>{
        let target = event.target;
        if(target.id){
            event.preventDefault()
        }else{
            let number = target.getAttribute("data-number");
            //改动背景div样式
            let bgcDiv = document.getElementById('bgc-'+ number);
            if(navLocation !== -1){
                let oldbgcDiv = document.getElementById('bgc-' + navLocation);
                oldbgcDiv.style.width = '0%';
            }
            navLocation = parseInt(number);
            bgcDiv.style.width = '100%';

            getContentList(number);
        }
    });
}

function bindCancel(){
    let cancel = document.getElementById('cancel-button');
    cancel.addEventListener('click',()=>{
        let shadowBox = document.getElementById('shadow-box');
        shadowBox.style.display = 'none';
    })
}

function firstTypeWriter(){
    try{
        let typed = new Typed("#typed", {
            strings: ["因这爬满遗憾的时光，^500 织就一场盛大而迷离的梦","Welcome to my Azure Dream..."],
            typeSpeed: 100,//打字的速度
            smartBackspace: true, // 开启智能退格 默认false
            backSpeed: 50,//后退速度
            backDelay: 500,//后退延迟
            loop:false,//是否循环 默认false
            showCursor:false,
            startDelay:1000,//起始时间
            fadeOut:true,//淡出效果
            fadeOutDelay:500,
            onComplete: (self) => {
                //删除span标签
                let typeSpan = document.getElementById('typed');
                typeSpan.style.opacity = 0;
                setTimeout(()=>{
                    typeSpan.remove();
                },1000)
            },
      });
    }catch(e){
        //屏蔽报错
    }
}

window.onload = function(){
    firstTypeWriter();
    bindNav();
    bindCancel();
};