/* siunusdev.com 
This script used for counting user(s) currently online on this website.
You can delete it if you want.
*/

startCounting = function() {
	if($.ajax !== undefined) {
		$.ajax({
			method: "GET",
			url: "https://dev.siunusdev.com/duco/online-counter.php"
		})
		.done(function(data) {
			let counterhtml = $('#siunusdev-online-counter');
			
			if(typeof data == 'object') {
				if(counterhtml.length > 0) {
					counterhtml.find('#counter-online').text(data.online);
					counterhtml.find('#counter-visitor').text(data.visitor);
					counterhtml.show();
				}
			}
		})
		.fail(function(error) {
			console.log(error);
		})
		.always(function() {
			setTimeout(startCounting, 150 * 1000);
		});
	}
}

startCounting();