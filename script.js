"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// Adding a username property into the each individual account
const createUserNames = accs => {
  accs.forEach(acc => {
    acc.userName = acc.owner
      .toLowerCase()
      .split(" ")
      .map(name => name[0])
      .join("");
  });
};
createUserNames(accounts);

//Add movements and display them
const displayMovements = (movements, sort = false) => {
  containerMovements.innerHTML = "";
  let movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach((mov, i) => {
    let type = mov > 0 ? "deposit" : "withdrawal";
    let html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__value">${mov}€</div>
        </div>`;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

// Calculate total balance and display it

const calcDisplayBalance = acc => {
  acc.balance = acc.movements.reduce((acc, curr) => acc + curr, 0);
  labelBalance.textContent = `${acc.balance}€`;
};

// Calculate the movement summary and display them
const calcDisplaySummary = acc => {
  const income = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumIn.textContent = `${income}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  // Assuming that the bank pays an interest of 1.2% on each deposit and only adds that interest if it is greater than 1 €
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposits => (deposits * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumInterest.textContent = `${interest}€`;
};

const updateUI = acc => {
  // display movements
  displayMovements(acc.movements);

  // display summary
  calcDisplaySummary(acc);

  // display balance
  calcDisplayBalance(acc);
};

//current account holder
let currAcc;

//Login handler
const loginHandler = e => {
  e.preventDefault();
  currAcc = accounts.find(acc => acc.userName === inputLoginUsername.value);

  //Logged In
  if (currAcc?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome ${currAcc.owner.split(" ")[0]}`;
    containerApp.style.opacity = 100;

    //Clear Input fields
    inputLoginPin.value = inputLoginUsername.value = "";
    inputLoginPin.blur();

    // updateUI
    updateUI(currAcc);
  }
};

//Transfer money

const transferMoneyHandler = e => {
  e.preventDefault();

  const transferedAcc = accounts.find(
    acc => acc.userName === inputTransferTo.value
  );

  //Adding a withdrawal to the current account and displaying them
  let transferAmount = Number(inputTransferAmount.value);

  //clear input fields
  inputTransferTo.value = inputTransferAmount.value = "";

  // checking if the user has the necessay amount to transfer
  if (
    transferAmount > 0 &&
    transferAmount <= currAcc.balance &&
    transferedAcc &&
    transferedAcc?.userName !== currAcc.userName
  ) {
    currAcc.movements.push(-transferAmount);

    // Update UI
    updateUI(currAcc);

    // Transferring money to the person
    transferedAcc?.movements.push(Math.abs(transferAmount));
  }
};

// Loan handler
const loanHandler = e => {
  e.preventDefault();
  let loanAmount = Number(inputLoanAmount.value);

  // The bank has a policy of granting loans only if the user has atleast a
  // deposit greater than 10% of the loan amount asked and the amount is less
  // than or equal to a million

  //Clearing the input value
  inputLoanAmount.value = "";

  if (
    loanAmount > 0 &&
    currAcc.movements.some(mov => mov >= loanAmount * 0.1) &&
    loanAmount < 1000000
  ) {
    currAcc.movements.push(loanAmount);

    updateUI(currAcc);
  }
};

//Deleting an account
const deleteAccountHandler = e => {
  e.preventDefault();
  if (
    inputCloseUsername.value === currAcc.userName &&
    Number(inputClosePin.value) === currAcc.pin
  ) {
    let currAccIndex = accounts.findIndex(
      acc => acc.userName === currAcc.userName
    );

    // deleting the account from the accounts array
    accounts.splice(currAccIndex, 1);

    //reflecting deletion in UI
    containerApp.style.opacity = 0;
  }
  // clearing the input fields
  inputCloseUsername.value = inputClosePin.value = "";
};

//sorting movements
let sort = false;
const sortMovementsHandler = e => {
  e.preventDefault();
  displayMovements(currAcc.movements, !sort);
  sort = !sort;
};

// Event handlers
btnLogin.addEventListener("click", loginHandler);
btnTransfer.addEventListener("click", transferMoneyHandler);
btnClose.addEventListener("click", deleteAccountHandler);
btnLoan.addEventListener("click", loanHandler);
btnSort.addEventListener("click", sortMovementsHandler);
