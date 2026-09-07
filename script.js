// ===== 電卓の「状態」をここでまとめて管理する =====
// currentValue   : 今画面に表示している数字（文字列で持つ）
// previousValue  : ひとつ前に確定した数字
// operator       : 選ばれている演算子（+ − × ÷）
// overwrite      : true なら次の数字入力で表示を上書きする
const state = {
  currentValue: '0',
  previousValue: null,
  operator: null,
  overwrite: true,
};

const displayMain = document.getElementById('displayMain');
const displaySub = document.getElementById('displaySub');

// 状態が変わるたびに、画面表示を最新の状態に合わせて更新する
function render() {
  displayMain.textContent = state.currentValue;
  displaySub.textContent = state.previousValue !== null && state.operator
    ? `${state.previousValue} ${state.operator}`
    : ' '; // 何もない時は空白（高さを保つため）
}

// 数字ボタンが押された時の処理
function inputDigit(digit) {
  if (state.overwrite) {
    state.currentValue = digit;
    state.overwrite = false;
  } else {
    // 桁数が増えすぎないように少し制限をかける
    if (state.currentValue.replace('-', '').length >= 12) return;
    state.currentValue = state.currentValue === '0' ? digit : state.currentValue + digit;
  }
}

// 「.」ボタンが押された時の処理（すでに小数点があれば無視する）
function inputDecimal() {
  if (state.overwrite) {
    state.currentValue = '0.';
    state.overwrite = false;
    return;
  }
  if (!state.currentValue.includes('.')) {
    state.currentValue += '.';
  }
}

// ＋−×÷ ボタンが押された時の処理
function chooseOperator(op) {
  if (state.operator && !state.overwrite) {
    // すでに演算子が選ばれていて、次の数字も入力済みなら先に計算する
    calculate();
  }
  state.previousValue = state.currentValue;
  state.operator = op;
  state.overwrite = true;
}

// 実際の四則演算をする部分
function calculate() {
  if (state.operator === null || state.previousValue === null) return;
  const prev = parseFloat(state.previousValue);
  const curr = parseFloat(state.currentValue);
  let result;

  switch (state.operator) {
    case '+': result = prev + curr; break;
    case '−': result = prev - curr; break;
    case '×': result = prev * curr; break;
    case '÷': result = curr === 0 ? NaN : prev / curr; break;
    default: return;
  }

  // 小数の誤差を丸めつつ、結果を文字列にする
  state.currentValue = Number.isNaN(result)
    ? 'エラー'
    : parseFloat(result.toFixed(10)).toString();
  state.previousValue = null;
  state.operator = null;
  state.overwrite = true;
}

function clearAll() {
  state.currentValue = '0';
  state.previousValue = null;
  state.operator = null;
  state.overwrite = true;
}

function backspace() {
  if (state.overwrite) return;
  state.currentValue = state.currentValue.length > 1
    ? state.currentValue.slice(0, -1)
    : '0';
  if (state.currentValue === '') state.currentValue = '0';
}

function percent() {
  state.currentValue = (parseFloat(state.currentValue) / 100).toString();
}

// ===== ボタンのクリックをまとめて拾って、上の関数に振り分ける =====
document.querySelectorAll('button').forEach((button) => {
  button.addEventListener('click', () => {
    const { num, op, action } = button.dataset;

    if (num !== undefined) inputDigit(num);
    else if (op !== undefined) chooseOperator(op);
    else if (action === 'decimal') inputDecimal();
    else if (action === 'equals') calculate();
    else if (action === 'clear') clearAll();
    else if (action === 'backspace') backspace();
    else if (action === 'percent') percent();

    render();
  });
});

// キーボード入力にも対応させておく
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
  else if (e.key === '.') inputDecimal();
  else if (e.key === '+') chooseOperator('+');
  else if (e.key === '-') chooseOperator('−');
  else if (e.key === '*') chooseOperator('×');
  else if (e.key === '/') { e.preventDefault(); chooseOperator('÷'); }
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'Backspace') backspace();
  else if (e.key === 'Escape') clearAll();
  else return;

  render();
});

render();
