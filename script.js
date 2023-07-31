"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-07-26T17:01:17.194Z",
    "2020-07-28T23:36:17.929Z",
    "2020-08-01T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

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
const displayMovements = (acc, sort = false) => {
  containerMovements.innerHTML = "";
  let movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  acc.movements.forEach((mov, i) => {
    const { year, month, day } = getCurrentDate();

    let type = mov > 0 ? "deposit" : "withdrawal";
    let html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
       <div class="movements__date">${day.toString().padStart(2, 0)}/${month
      .toString()
      .padStart(2, 0)}/${year}</div>
          <div class="movements__value">${mov.toFixed(2)}€</div>
        </div>`;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

// Calculate total balance and display it

const calcDisplayBalance = acc => {
  acc.balance = acc.movements.reduce((acc, curr) => acc + curr, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
  const { year, month, day, hour, min } = getCurrentDate();
  labelDate.textContent = `${day.toString().padStart(2, 0)}/${month
    .toString()
    .padStart(2, 0)}/${year},${hour.toString().padStart(2, 0)}:${min
    .toString()
    .padStart(2, 0)}`;
};

// Calculate the movement summary and display them
const calcDisplaySummary = acc => {
  const income = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumIn.textContent = `${income.toFixed(2)}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;

  // Assuming that the bank pays an interest of 1.2% on each deposit and only adds that interest if it is greater than 1 €
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposits => (deposits * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const updateUI = acc => {
  // display movements
  displayMovements(acc);

  // display balance
  calcDisplayBalance(acc);

  // display summary
  calcDisplaySummary(acc);
};

//Get current date
const getCurrentDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const min = date.getMinutes();
  return {
    year,
    month,
    day,
    hour,
    min,
  };
};

//current account holder
let currAcc;

//Login handler
const loginHandler = e => {
  e.preventDefault();
  currAcc = accounts.find(acc => acc.userName === inputLoginUsername.value);

  //Logged In
  if (currAcc?.pin === +inputLoginPin.value) {
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
  let transferAmount = +inputTransferAmount.value;

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
    currAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currAcc);

    // Transferring money to the person
    transferedAcc?.movements.push(Math.abs(transferAmount));
    transferedAcc?.movementsDates.push(new Date().toISOString());
  }
};

// Loan handler
const loanHandler = e => {
  e.preventDefault();
  let loanAmount = Math.floor(inputLoanAmount.value);

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
    currAcc.movementsDates.push(new Date().toISOString());

    updateUI(currAcc);
  }
};

//Deleting an account
const deleteAccountHandler = e => {
  e.preventDefault();
  if (
    inputCloseUsername.value === currAcc.userName &&
    +inputClosePin.value === currAcc.pin
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
