document.addEventListener("DOMContentLoaded", () => {
	const display = document.getElementById("result");
	const buttons = document.querySelectorAll(".btn");

	const isOperator = (value) => ["+", "-", "*", "/"].includes(value);

	const appendValue = (value) => {
		if (!display) {
			return;
		}

		if (value === "=") {
			try {
				display.value = display.value ? String(eval(display.value)) : "";
			} catch (error) {
				display.value = "Error";
			}
			return;
		}

		if (value === "C") {
			display.value = "";
			return;
		}

		if (display.value === "Error") {
			display.value = "";
		}

		const lastChar = display.value.slice(-1);
		if (isOperator(value) && isOperator(lastChar)) {
			display.value = display.value.slice(0, -1) + value;
			return;
		}

		display.value += value;
	};

	buttons.forEach((button) => {
		button.addEventListener("click", () => {
			appendValue(button.textContent.trim());
		});
	});
});
