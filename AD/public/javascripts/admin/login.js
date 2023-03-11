let loginbox = document.querySelector('#loginbox');
let form = document.querySelector('#loginform')
let span;
let inTime, outTime;
let canIn = true;
let canOut;

window.onload = ()=>{
    let tokenStr = localStorage.getItem('token');
    fetch('/admin/manager',{
        headers:{
            'Authorization':tokenStr
        }
    }).then(res=>{
        return res.json();
    }).then(data=>{
        if(data.code===1){
            window.location.href = '/root';
        }
    }).catch(e=>{//401就继续登录
        console.log(e);
    })
    
}

loginbox.addEventListener("mouseenter", (e) => {
    canOut = false;
    if (canIn) {
        inTime = new Date().getTime();
        span = document.createElement("span");
        loginbox.appendChild(span);
        //使用动画
        span.style.animation = 'mousein 0.5s ease-out forwards';

        let top = e.clientY - e.target.offsetTop;
        let left = e.clientX - e.target.offsetLeft;
        span.style.top = top + 'px';
        span.style.left = left + 'px';

        canIn = false;
        canOut = true;
    }
});

loginbox.addEventListener("mouseleave", (e) => {
    if (canOut) {
        outTime = new Date().getTime();
        let passTime = outTime - inTime;
        if (passTime < 500) {
            setTimeout(mouseleave, 500 - passTime);
        } else {
            mouseleave();
        }
    }
    function mouseleave() {
        span.style.animation = 'mouseout .5s ease-out forwards';
        let top = e.clientY - e.target.offsetTop;
        let left = e.clientX - e.target.offsetLeft;
        span.style.top = top + 'px';
        span.style.left = left + 'px';
        setTimeout(() => {
            loginbox.removeChild(span);
            canIn = true;
        }, 500)
    }
})

form.addEventListener('submit',(e)=>{
    e.preventDefault();
    //插入动画
    let button = document.querySelector(".login-button");
    button.childNodes[0].data = "验证中...";
    //序列化表单数据
    const formData = new FormData(e.target);
    let data = {}
    formData.forEach((key, val) => {
        data[val] = key;
    })
    //发送请求
    fetch('/admin/tologin',{
        method:'POST',
        body:JSON.stringify(data),
        headers:{
            'Content-Type':'application/json'
        }
    }).then(response=>{
        return response.json();
    }).then(result=>{
        console.log(result);
        let {code,msg, token, url} = result;
        if(code === 1){
            button.childNodes[0].data = msg;
            localStorage.setItem('token',token);
            window.location.href = '/root';
        }else{//failure
            console.log(code);
            alert("error!");
        }
    }).catch(e=>{
        console.log("error: "+e);
    })
})