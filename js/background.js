console.log("%c ĐKHP UIT - Truoc Phan\n%chttps://www.facebook.com/TruocPhan.PTT/", "color: green; font-style: italic; font-size: 42px", "font-size: 16px;");

var ptt_dkhp = {
	name: "username", // Thay đổi thành tài khoản chứng thực của bạn
	pass: "password", // Password của tài khoản chứng thực
};

/***
	Điền mã lớp cần đăng ký
	+ Đối với những môn không có thực hành:
		key: {
			0: "MaLop-LT"
		}
	+ Đối với những môn có thực hành:
		key: {
			0: "MaLop-LT",
			1: "MaLop-TH"
		}
	(key tăng từ 0 đến n)
***/
var ptt_malop = {
	// Mã lớp NT115.J11.ANTN
	0: {
		0: "NT115.J11.ANTN"
	},
	// Mã lớp NT133.J11.ANTN (LT + TH)
	1: {
		0: "NT133.J11.ANTN",
		1: "NT133.J11.ANTN.1"
	},
	// Mã lớp NT204.J11.ANTN (LT + TH)
	2: {
		0: "NT204.J11.ANTN",
		1: "NT204.J11.ANTN.1"
	},
	// Mã lớp NT207.J11.ANTN (LT + TH)
	3: {
		0: "NT207.J11.ANTN",
		1: "NT207.J11.ANTN.1"
	},
	// Mã lớp NT532.J11.ANTN (LT + TH)
	4: {
		0: "NT532.J11.ANTN",
		1: "NT532.J11.ANTN.1"
	},
	// Mã lớp SS001.J11
	5: {
		0: "SS001.J11"
	}
};

var ptt_dk_thanhcong = {};

// Flag kiểm tra đăng nhập
var ptt_Flag = false;

var ptt_callback = setInterval(
	function(){
		jQuery.ajax(
			{
				"url": "https://dkhp.uit.edu.vn/",
				error: function(xhr, status){
    				if(xhr.status == 200)
    				{
    					// Đăng ký từng môn
						for(var k in ptt_malop){
							$.ajaxSetup({async: false});

							// Đăng nhập vào https://dkhp.uit.edu.vn/
							$.post(
								"https://dkhp.uit.edu.vn/",
								{"name": ptt_dkhp.name, "pass": ptt_dkhp.pass, "form_id": "user_login", "op": "Log in"}
							).done(
								function(data){

									// Nếu đăng nhập thất bại
									if(/Error message/.test(data)){
										ptt_Flag = false;
										alert("Username hoặc Password không đúng.");
									}
									else{
										ptt_Flag = true;

										// Get source code https://dkhp.uit.edu.vn/sinhvien/hocphan/dangky/ để lấy form_build_id và form_token
										$.get(
											"https://dkhp.uit.edu.vn/sinhvien/hocphan/dangky"
										).done(
											function(data1){
												var form_build_id = /name="form_build_id" value="(.*)"/.exec(data1)[1];
												var form_token = /name="form_token" value="(.*)"/.exec(data1)[1];

												var ptt_post_data = {};
												for(var k1 in ptt_malop[k]){
													console.warn("Đang cố gắng đăng ký mã lớp " + ptt_malop[k][k1]);
													ptt_post_data["table_lophoc[" + ptt_malop[k][k1] + "]"] = ptt_malop[k][k1];
												}
												ptt_post_data["dsmalop"] = "";
												ptt_post_data["loaimonhoc"] = "";
												ptt_post_data["khoaql"] = "";
												ptt_post_data["mamh"] = "";
												ptt_post_data["op"] = "Đăng ký";
												ptt_post_data["txtmasv"] = ptt_dkhp.name;
												ptt_post_data["form_build_id"] = form_build_id
												ptt_post_data["form_token"] = form_token;
												ptt_post_data["form_id"] = "uit_dkhp_dangky_form";

												// Gửi request đăng ký môn học 
												$.post(
													"https://dkhp.uit.edu.vn/sinhvien/hocphan/dangky",
													ptt_post_data,
												).done(
													function(data2){
														for(var k1 in ptt_malop[k]){
															var pattern = new RegExp("table_lophoc_dadk\\[" + ptt_malop[k][k1].replace(".", "\\.") + "\\]");

															// Kiểm tra nếu đăng ký thành công
															if(pattern.test(data2)){
																chrome.notifications.create(
																	ptt_malop[k][k1],
																	{
																		type: "basic",
																		iconUrl: "../images/icon.png",
																		title: "ĐKHP UIT",
																		message: "Mã lớp " + ptt_malop[k][k1] + " đã đăng ký thành công!"
																	}
																);
																ptt_dk_thanhcong[k] = "";
																console.log("%c[" + (((new Date().getHours()) <= 9) ? ("0"+(new Date().getHours())) : (new Date().getHours())) + ":" + (((new Date().getMinutes()) <= 9) ? ("0"+(new Date().getMinutes())) : (new Date().getMinutes())) + ":" + (((new Date().getSeconds()) <= 9) ? ("0"+(new Date().getSeconds())) : (new Date().getSeconds())) + "] Mã lớp " + ptt_malop[k][k1] + " đã đăng ký thành công!", "color: blue;");
																delete ptt_malop[k][k1];
															}
														}
													}
												);
											}
										);
									}
								}
							);

							// Thoát khỏi vòng lặp for nếu đăng nhập thất bại
							if(!ptt_Flag)
								break;
						}
						
						if(!ptt_Flag)
							clearInterval(ptt_callback);

						// Xóa các lớp đã đăng ký thành công
						for(var k in ptt_dk_thanhcong){
							delete ptt_malop[k];
						}

						// Nếu đã đăng ký thành công hết tất cả mã lớp
						if(Object.keys(ptt_malop).length == 0)
						{
							console.log("%c[" + (((new Date().getHours()) <= 9) ? ("0"+(new Date().getHours())) : (new Date().getHours())) + ":" + (((new Date().getMinutes()) <= 9) ? ("0"+(new Date().getMinutes())) : (new Date().getMinutes())) + ":" + (((new Date().getSeconds()) <= 9) ? ("0"+(new Date().getSeconds())) : (new Date().getSeconds())) + "] Tất cả mã lớp đã đăng ký thành công!", "color: blue; font-size: 20px;");
							clearInterval(ptt_callback);
						}
    				}
    				else
    				{
    					console.warn(xhr.status+": "+xhr.statusText);
    				}
    			}
			}
		);
	},
	5000
);
