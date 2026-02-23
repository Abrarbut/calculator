document.addEventListener("DOMContentLoaded", () => {
  const display = document.getElementById("result");
  const expression = document.getElementById("expression");
  const buttons = document.querySelectorAll(".btn");

  // Internal expression uses real operators; display shows pretty symbols
  let expr = "";
  let justEvaluated = false;

  const isOperator = (ch) => ["+", "-", "*", "/"].includes(ch);

  const prettyExpr = (e) =>
    e.replace(/\*/g, "×").replace(/\//g, "÷");

  const render = () => {
    display.value = expr === "" ? "" : expr;
    display.placeholder = "0";
  };

  const evaluate = () => {
    if (!expr) return;
    try {
      let evalExpr = expr;

      // Strip any trailing operator, dot, or stray opening paren
      evalExpr = evalExpr.replace(/[+\-*/%.]+(\s*)$/g, "").trim();
      if (!evalExpr) return;

      // Auto-close unclosed parentheses
      const opens = (evalExpr.match(/\(/g) || []).length;
      const closes = (evalExpr.match(/\)/g) || []).length;
      evalExpr += ")".repeat(Math.max(0, opens - closes));

      // Map trig names to Math.* methods
      evalExpr = evalExpr
        .replace(/\bsin\(/g, "Math.sin(")
        .replace(/\bcos\(/g, "Math.cos(")
        .replace(/\btan\(/g, "Math.tan(");

      // % logic:
      //   number % number  → modulo (keep JS % as-is)
      //   number %         → divide by 100 (percentage suffix)
      evalExpr = evalExpr.replace(/(\d+(?:\.\d+)?)%(?!\d|\.)/g, "($1/100)");

      const result = Function('"use strict"; return (' + evalExpr + ")")();

      if (!isFinite(result)) throw new Error("Not finite");

      expression.textContent = prettyExpr(expr) + " =";
      expr = String(parseFloat(result.toPrecision(12)));
      display.value = expr;
      justEvaluated = true;
    } catch {
      display.value = "Error";
      expression.textContent = "";
      expr = "";
    }
  };

  const handleAction = (action) => {
    // After evaluation, start fresh for operators; clear for new number
    if (justEvaluated) {
      if (isOperator(action)) {
        justEvaluated = false;
      } else if (action !== "=" && action !== "backspace") {
        expr = "";
        expression.textContent = "\u00a0";
        justEvaluated = false;
      }
    }

    switch (action) {
      case "=":
        evaluate();
        break;

      case "C":
        expr = "";
        expression.textContent = "\u00a0";
        display.value = "";
        display.placeholder = "0";
        justEvaluated = false;
        break;

      case "backspace": {
        // If expression ends with a function name like 'sin(' remove the whole token
        const fnMatch = expr.match(/(sin\(|cos\(|tan\(|Math\.log10\(|Math\.log\(|Math\.sqrt\()$/);
        if (fnMatch) {
          expr = expr.slice(0, -fnMatch[0].length);
        } else {
          expr = expr.slice(0, -1);
        }
        render();
        break;
      }

      case "sin":
      case "cos":
      case "tan":
        expr += action + "(";
        render();
        break;

      case "log":
        expr += "Math.log10(";
        render();
        break;

      case "ln":
        expr += "Math.log(";
        render();
        break;

      case "sqrt":
        expr += "Math.sqrt(";
        render();
        break;

      case "pow":
        expr += "**";
        render();
        break;

      case "pi":
        expr += String(Math.PI);
        render();
        break;

      case "e":
        expr += String(Math.E);
        render();
        break;

      case "paren": {
        // Smart parenthesis: open if unbalanced count allows, else close
        const opens = (expr.match(/\(/g) || []).length;
        const closes = (expr.match(/\)/g) || []).length;
        expr += opens > closes ? ")" : "(";
        render();
        break;
      }

      default:
        // Prevent double operators (allow negative sign after operator)
        if (isOperator(action) && isOperator(expr.slice(-1))) {
          expr = expr.slice(0, -1) + action;
        } else if (action === "%" && isOperator(expr.slice(-1))) {
          // Don't allow % right after an operator
          break;
        } else {
          expr += action;
        }
        render();
    }
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.action;
      if (action) handleAction(action);
    });
  });

  // Keyboard support
  document.addEventListener("keydown", (e) => {
    const map = {
      Enter: "=",
      "=": "=",
      Backspace: "backspace",
      Escape: "C",
      "%": "%",
      "+": "+",
      "-": "-",
      "*": "*",
      "/": "/",
      "(": "paren",
      ")": "paren",
      "^": "pow",
      s: "sin",
      c: "cos",
      t: "tan",
      l: "log",
      r: "sqrt",
    };
    const digits = "0123456789.";
    if (digits.includes(e.key)) {
      handleAction(e.key);
    } else if (map[e.key]) {
      e.preventDefault();
      handleAction(map[e.key]);
    }
  });
});
