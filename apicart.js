var AddressID;
var isCheckOut = false;
var isAddress;
var isOrderStart = false;
var isCheckOut = false;
var SkuID;
var Price;
var Maxqty;
var detailed_data = [];
var orderId = false;
var url =  window.location.pathname;
var c = 0;
var inCart = false;
var aid;
var myskuId ;
var max_qty = 2;
var myskuprice ;

$(document).ready(function($){
	console.log("running ");
		if(url.search("/in/goods/")>=0){
			getAddressdata();
			getorderDetails();
			setCheckoutOnOff();
			autoCheckout();
		}

});


function getorderDetails(){
	var pid = url.split('goods/')[1];
	showtoconsole("Start getting order details ");
	getDetails(pid);
	showtoconsole("Finshed getting order details ");
}


function getAddressdata(){
	 chrome.storage.local.get("addressId",function(d){
	 	if(d.addressId === undefined){
	 		getAddressdata2();
	 	}else{
	 		AddressID = d.addressId;
	 		showtoconsole("address id is found "+AddressID);
	 	}});
	 
}
function getAddressdata2(){
var t = setInterval(function(){
    if(isAddress){
         clearInterval(t);
    }else{
        setAdd();
    }
},2000);
}


// setTimeout(function(){
// max_qty = 2;
// myskuId= detailed_data[keys[0]]['skuId'];
// myskuprice = detailed_data[keys[0]]['price'];
// showtoconsole(myskuprice+" "+myskuId);
// setOrder();
// },5000);




function showtoconsole(d){
    try{
        var t = document.getElementById("created");
        var xx = t.innerText;
                t.innerText = d+"\n"+xx;
        
    }catch(e){
        document.getElementById("created").innerText = "error to display data";
    }
}


function setOrder(){
            order(myskuId, max_qty, myskuprice); 
            createPurchase(AddressID);
            var x = setInterval(function () { 
                if (inCart) {
                    clearInterval(x);
                }
                else {
                    order(myskuId, max_qty, myskuprice);
                    createPurchase(AddressID);
                }
             }, 3000);
}


function getDetails(productId) {
   var url = 'https://api.realme.com/in/product/detail?productId='+productId;
    var http = new XMLHttpRequest();
    http.open('get', url, true);
    http.setRequestHeader("Content-Type", "application/json");    
    http.onreadystatechange = function (response, textStatus, jQxhr) {
        if(http.readyState == 4 && http.status == 200) {
             if (http.responseText) {
                detailed_data = (JSON.parse(http.responseText)).data;
                showtoconsole(detailed_data);
                setOrderOption(detailed_data);
                setOderOnOff();
                mainMakeOrder();
                  }
            else {
                showtoconsole("Unable to get product details");
            }
        }
    }
    http.send();
}

function mainMakeOrder(){
	order(myskuId, max_qty, myskuprice);
	setInterval(function(){
	if(isOrderStart){
		if(inCart){
			if(isCheckOut){

			}else{
				createPurchase(AddressID);
			}
		}else{
			console.log("running orfdre1");
			order(myskuId, max_qty, myskuprice);
			console.log("running orfdre2");
			createPurchase(AddressID);
		}
	}
	},3000);
}

function createPurchase(aid) {
    showtoconsole("sended "+aid);
    url = 'https://api.realme.com/in/order/purchase/create';
    data = '{"addressId":"'+aid+'","prizeType":"","prizeCode":"","invoiceCategory":1,"invoiceTitle":"","invoiceTaxNo":"","purchaseType":"1","ignoreAdditionNos":[],"quoteUid":"","payMode":""}';
    var http = new XMLHttpRequest();
    http.open('post', url, true);
    http.setRequestHeader("Content-Type", "application/json");    
    http.onreadystatechange = function (response, textStatus, jQxhr) {
        if(http.readyState == 4 && http.status == 200) {
            showtoconsole(http.responseText);
            var obj = JSON.parse(http.responseText);
            if (obj['msg']  == 'success') {
               obj = response['data'];
               isCheckOut = true;
                showtoconsole("Created Order with Order ID: "+orderId);
                window.location.href = "https://buy.realme.com/in/paytm?orderNo="+orderId;
            }
            else {
                showtoconsole(obj['msg']);
            }
        }
    }
    http.send(data);
}

function order(sku, quantity, price) {
	showtoconsole(sku+'  '+quantity+' '+price);
    var  url = 'https://api.realme.com/in/order/purchase/checkout';
    var data = '{"ignoreAdditionNos":[],"skuList":[{"skuName":"","price":'+price+',"skuId":'+sku+',"count":'+quantity+',"giftNos":[],"packageNos":[],"limitOfferCode":""}],"realmeCode":"","purchaseType":1,"pincode":""}';
    var http = new XMLHttpRequest();
    http.open('post', url, true);
    http.setRequestHeader("Content-Type", "application/json");    
    http.onreadystatechange = function (response, textStatus, jQxhr) {
        if(http.readyState == 4 && http.status == 200) {
            showtoconsole(http.responseText);
            var obj = JSON.parse(http.responseText);
            if (obj['msg']  == 'success') {
                inCart = true;
                showtoconsole("Added to cart Now creating Order.. ");
                createPurchase(aid);
            }
            else {
                 showtoconsole(obj['msg']);
            }
        }
    }
    http.send(data);
}


function setAdd() {
    var url = 'https://api.realme.com/in/user/address/list';
    var http = new XMLHttpRequest();
    http.open('get', url, true);
    http.setRequestHeader("Content-Type", "application/json");    
    http.onreadystatechange = function (response, textStatus, jQxhr) {
        if(http.readyState == 4 && http.status == 200) {
            var addressdata =  JSON.parse(http.responseText);
            showtoconsole(response["srcElement"]["response"]);
            if(addressdata['msg']  == 'success') {
                AddressID = addressdata['data']['records']['0']['id'];
                chrome.storage.local.set({addressId:AddressID},function(d){});
                showtoconsole(AddressID+" is set");
                isAddress = true;                
            }
            else {
             showtoconsole("Unable to set address");
            }
        }
    }
    http.send();
}




function setOderOnOff(){
	try {
		var style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML =".switch {   position: relative;   display: inline-block;   width: 60px;   height: 34px; }  .switch input {    opacity: 0;   width: 0;   height: 0; }  .slider {   position: absolute;   cursor: pointer;   top: 0;   left: 0;   right: 0;   bottom: 0;   background-color: #ccc;   -webkit-transition: .4s;   transition: .4s; }  .slider:before {   position: absolute;   content: '';   height: 26px;   width: 26px;   left: 4px;   bottom: 4px;   background-color: white;   -webkit-transition: .4s;   transition: .4s; }  input:checked + .slider {   background-color: #2196F3; }  input:focus + .slider {   box-shadow: 0 0 1px #2196F3; }  input:checked + .slider:before {   -webkit-transform: translateX(26px);   -ms-transform: translateX(26px);   transform: translateX(26px); }  .slider.round {   border-radius: 34px; }  .slider.round:before {   border-radius: 50%; }";
		document.body.appendChild(style);
		var label = document.createElement('label');
		var input=document.createElement('input');
		var span=document.createElement('span');
		input.setAttribute("type","checkbox");
		input.setAttribute("id","OrderOnOff");
		label.setAttribute("class","switch");
		span.setAttribute("class","slider round");
		label.appendChild(input);
		label.appendChild(span);
		var Block = document.createElement('div');
		Block.style="width: auto; height: auto; position: fixed; right: 3%; top: 53%; z-index: 99999; border-radius: 10px; background: rgb(255, 255, 0); margin-right: auto; margin-left: 220px;";
		Block.appendChild(label);
		document.body.appendChild(Block);
		input.addEventListener( 'change', orderOnOffReact);	
		input.addEventListener( 'onchange', orderOnOffReact);	
	} catch(e){
		console.log("error to load logo "+e.message);
	}
}

function orderOnOffReact(){
	if(this.checked){
		var orderIdAndValue = document.getElementById("vkOrderID").value;
		myskuId = orderIdAndValue.split('|')[0];
        myskuprice = orderIdAndValue.split('|')[1];
		isOrderStart = true;
		showtoconsole("Working Start");
	}
	else{
		isOrderStart = false;
		showtoconsole("Start Stop");
	}
}


function setOrderOption(detailed_data){
	var keys = Object.keys(detailed_data);
	var order_html = "";
	keys.forEach(key => {
	    order_html += "<option value=" + detailed_data[key]['skuId'] +"|"+ detailed_data[key]['price'] +">" + detailed_data[key]['skuName'] + "</option>";
	});

	try {
		var select = document.createElement("select");
  		select.name = "vkcard";
  		select.id = "vkOrderID";
  		select.innerHTML = order_html;
  		var label = document.createElement("label");
  		label.innerHTML = "Select Order: "
  		label.htmlFor = "Select Order";
  		var Block = document.createElement('div');
		Block.style="width: auto; height: auto; position: fixed; right: 3%; top: 5%; z-index: 99999; border-radius: 10px; background: rgb(255, 255, 0); margin-right: auto; margin-left: 220px;";
		Block.appendChild(label).appendChild(select);
		document.body.appendChild(Block);
	} catch(e){
		console.log("error to load logo "+e.message);
	}
}





function setCheckoutOnOff(){
	try {
		var style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML =".switch {   position: relative;   display: inline-block;   width: 60px;   height: 34px; }  .switch input {    opacity: 0;   width: 0;   height: 0; }  .slider {   position: absolute;   cursor: pointer;   top: 0;   left: 0;   right: 0;   bottom: 0;   background-color: #ccc;   -webkit-transition: .4s;   transition: .4s; }  .slider:before {   position: absolute;   content: '';   height: 26px;   width: 26px;   left: 4px;   bottom: 4px;   background-color: white;   -webkit-transition: .4s;   transition: .4s; }  input:checked + .slider {   background-color: #2196F3; }  input:focus + .slider {   box-shadow: 0 0 1px #2196F3; }  input:checked + .slider:before {   -webkit-transform: translateX(26px);   -ms-transform: translateX(26px);   transform: translateX(26px); }  .slider.round {   border-radius: 34px; }  .slider.round:before {   border-radius: 50%; }";
		document.body.appendChild(style);
		var label = document.createElement('label');
		var input=document.createElement('input');
		var span=document.createElement('span');
		input.setAttribute("type","checkbox");
		input.setAttribute("id","CheckOnOff");
		label.setAttribute("class","switch");
		span.setAttribute("class","slider round");
		label.appendChild(input);
		label.appendChild(span);
		var Block = document.createElement('div');
		Block.style="width: auto; height: auto; position: fixed; right: 3%; top: 80%; z-index: 99999; border-radius: 10px; background: rgb(255, 255, 0); margin-right: auto; margin-left: 220px;";
		Block.appendChild(label);
		document.body.appendChild(Block);
		input.addEventListener( 'change', CheckoutOnOffReact);	
		input.addEventListener( 'onchange', CheckoutOnOffReact);	
	} catch(e){
		console.log("error to load logo "+e.message);
	}
}

function CheckoutOnOffReact(){
	if(this.checked){
	isCheckOut = true;
	}else{
		isCheckOut = false;
	}
}

function autoCheckout(){
	setInterval(function(){
		if(isCheckOut){
			createPurchase(AddressID);
		}
		showtoconsole(" Checkout = "+isCheckOut);
		}
		,500);
}