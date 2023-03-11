//查询字符串添加到url末尾
function addURLParam(url, name, value) {
    url += (url.indexOf("?") == -1 ? "?" : "&");
    url += encodeURIComponent(name) + "=" + encodeURIComponent(value);
    return url;
}
//原生xhttp请求
function xhrRequest(para) {
    let { type, url, isAsyn, requestBody, contentType } = para;
    console.log(para);
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            let { status, responseText } = xhr;
            console.log(xhr);
            if ((status >= 200 && status < 300) || status == 304) {
                console.log(responseText);
            } else {
                console.log("Request was unsuccessful: " + status);
            }
        }
    };
    //如果是POST请求，只需要设置请求头
    if (type === 'POST') {
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        //POST必须发送请求体
        if (!requestBody) {
            requestBody = {};
        }
    }
    //只能访问同源URL：域名、端口、协议都必须相同
    url = addURLParam(url, "contentType", contentType);
    xhr.open(type, url, isAsyn);
    xhr.send(requestBody);
}

//fetch get
async function fetchRequest(para) {
    let { type, url, init, contentType } = para;
    //GET请求的body直接添加到url中去
    if (type === 'GET') {
        url = addURLParam(url, "contentType", contentType);
    }
    init = init === null ? {} : init;
    let data = await fetch(url, init)
        .then((res) => {
            return res.json();
        }).then((data) => {
            return data;
        }).catch((e) => {
            console.log("Request unsuccessfully!\n" + e);
        });
    return data;
}