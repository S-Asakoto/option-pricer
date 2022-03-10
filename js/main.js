function changeType() {
	$("div[data-show]").each(function() {
		if (this.dataset.show.indexOf(document.forms[0].optionType.value) >= 0) {
			$(this).show();
			$("input", this).prop("disabled", false);
		}
		else {
			$(this).hide();
			$("input", this).prop("disabled", true);
		}
	});
}

$("input[name=optionType]").on("change", changeType);
changeType();

$("*[data-show-calc]").each(function() {
	var calcType = +this.dataset.calcType;
	var target = $("input", this)[0].name;
	var _this = this;

	var calcBtn = document.createElement("button");
	calcBtn.classList.add("calc-btn");
	calcBtn.innerHTML = "&#x1F5A9;";
	calcBtn.onclick = function(e) {
		e.preventDefault();
		e.stopPropagation();
		var xpos = window.innerWidth - _this.getBoundingClientRect().right;
		var ypos = _this.getBoundingClientRect().top;
		document.forms[calcType].style.top = "calc(" + ypos + "px)";
		document.forms[calcType].style.right = "calc(" + xpos + "px + 2em)";
		document.forms[calcType].target.value = target;
		$("form.sub-calc").hide();
		$(document.forms[calcType]).show();
	}
	$(".field", this).append(calcBtn);
});

function formatPrice(x) {
	return "$" + x.toFixed(4);
}

function formatPercent(x) {
	return (x * 100).toFixed(4) + "%";
}

$("form:not(.sub-calc)").on("submit", function(e) {
	e.preventDefault();
	e.stopPropagation();
	if (!this.checkValidity())
		return false;

	var spotPrice = +document.forms[0].spotPrice.value;
	var volatility = +document.forms[0].volatility.value / 100;
	var interestRate = +document.forms[0].interestRate.value / 100;
	var repoRate = +document.forms[0].repoRate.value / 100;
	var maturity = +document.forms[0].maturity.value;
	var strikePrice = +document.forms[0].strikePrice.value;
	var steps = +document.forms[0].steps.value;
	var paths = +document.forms[0].paths.value;
	var premium = +document.forms[0].premium.value;
	var control = +document.forms[0].control.value;
	var call = +document.forms[0].call.value;

	var r = $("#result").hide();
	setTimeout(function() {
		if (document.forms[0].optionType.value == "eu") {
			$("em", r).text("Option Price");
			$("div", r).text(formatPrice([europeanPut, europeanCall][call](spotPrice, strikePrice, 0, maturity, volatility, interestRate, 0)));
			r.show();
		}
		else if (document.forms[0].optionType.value == "vo") {
			$("em", r).text("Implied Volatility");
			$("div", r).text(formatPercent(implied(spotPrice, strikePrice, 0, maturity, interestRate, repoRate, premium, call)));
			r.show();
		}
		else if (document.forms[0].optionType.value == "am") {
			$("em", r).text("Option Price");
			$("div", r).text(formatPrice(american(spotPrice, strikePrice, 0, maturity, volatility, interestRate, steps, call)));
			r.show();
		}
		else if (document.forms[0].optionType.value == "ga") {
			$("em", r).text("Option Price");
			$("div", r).text(formatPrice([gaPut, gaCall][call](spotPrice, strikePrice, 0, maturity, volatility, interestRate, steps)));
			r.show();
		}
	}, 1);
});

$("form.sub-calc").each(function(e) {
	var form = this;
	$(".close", this).on("click", function() {
		$(form).hide();
	});
}).on("submit", function(e) {
	e.preventDefault();
	e.stopPropagation();
	if (!this.checkValidity())
		return false;

	var calcType = this.dataset.calcType;
	var result = 0;
	var target = this.target.value;

	if (calcType == 1)
		result = +document.forms[1].stockPrice.value / +document.forms[1].redemptionRate.value;
	else if (calcType == 2)
		result = (new Date(document.forms[2].maturityDate.value).getTime() - new Date().getTime()) / 365 / 86400000;
	document.forms[0][target].value = result.toFixed(4);
	$(this).hide();
}).hide();
