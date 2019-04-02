let player = 'youtube';
let youtube = "https://www.youtube.com/embed/G9djA4t0VY8";
let tencent = "https://v.qq.com/txp/iframe/player.html?vid=u0381k3nk25";
fetch("https://extreme-ip-lookup.com/json", { method: "get" })
  .then(response => response.json())
  .then(json => {
	  var country = json.country_code; 
	  if(country === "CN"){
          // if IP shows that the user is in Mainland China
			$w("#introVideo").src = tencent;
			player = 'tencent';
			$w("#playerSwitch").checked = false;
	  	}
	  });

export function playerSwitch_click(event) {
	if (player === 'youtube') {
		$w("#introVideo").src = tencent;        
		player = 'tencent';
		}    
	else {
		$w("#introVideo").src = youtube;        
		player = 'youtube';
		}
}