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
    "2023-07-28T17:01:17.194Z",
    "2023-07-25T23:36:17.929Z",
    "2023-07-29T10:51:36.790Z",
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

//days passed function
const daysPassed = (date1, date2) =>
  Math.round(Math.abs(date1 - date2) / (1000 * 24 * 60 * 60));

//Format dates passed into display function
const formatMovementDays = (date, acc) => {
  const days = daysPassed(date, new Date());
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days <= 7) return `${days} days ago`;

  return new Intl.DateTimeFormat(acc.locale).format(date);
};

//Format movements function
const formatMovs = (mov, locale, currency) => {
  const options = {
    style: "currency",
    currency: currency,
  };
  return new Intl.NumberFormat(locale, options).format(mov);
};

//Add movements and display them
const displayMovements = (acc, sort = false) => {
  containerMovements.innerHTML = "";
  let movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach((mov, i) => {
    const date = new Date(acc.movementsDates[i]);
    const timePassed = formatMovementDays(date, acc);
    const formattedCurr = formatMovs(mov, acc.locale, acc.currency);

    let type = mov > 0 ? "deposit" : "withdrawal";
    let html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
       <div class="movements__date">${timePassed}</div>
          <div class="movements__value">${formattedCurr}</div>
        </div>`;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

//Add the currDate function that provides the date in a nice formatted way

const currDate = (locale = "en-US", options) => {
  return new Intl.DateTimeFormat(locale, options).format(new Date());
};

// Calculate total balance and display it
const calcDisplayBalance = acc => {
  acc.balance = acc.movements.reduce((acc, curr) => acc + curr, 0);
  labelBalance.textContent = formatMovs(acc.balance, acc.locale, acc.currency);

  //Adding the date and the timer
  const options = {
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    year: "numeric",
    month: "numeric",
  };
  labelDate.textContent = currDate(acc.locale, options);
};

// Calculate the movement summary and display them
const calcDisplaySummary = acc => {
  const income = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumIn.textContent = formatMovs(income, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumOut.textContent = formatMovs(Math.abs(out), acc.locale, acc.currency);

  // Assuming that the bank pays an interest of 1.2% on each deposit and only adds that interest if it is greater than 1 €
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposits => (deposits * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumInterest.textContent = formatMovs(interest, acc.locale, acc.currency);
};

const updateUI = acc => {
  // display movements
  displayMovements(acc);

  // display balance
  calcDisplayBalance(acc);

  // display summary
  calcDisplaySummary(acc);
};

//variable that holds interval id
let timer;

// The logout timer function
const logOutTimer = () => {
  // clearing the timer
  if (timer) clearInterval(timer);

  // Logout timer
  // The user gets logged out after 5 minutes
  let time = 300;
  let min = Math.trunc(time / 60);
  let sec = time % 60;
  labelTimer.textContent = `${min.toString().padStart(2, 0)}:${sec
    .toString()
    .padStart(2, 0)}`;

  timer = setInterval(() => {
    min = Math.trunc(time / 60);
    sec = time % 60;
    if (time === 0) {
      // logout
      clearInterval(timer);
      labelWelcome.textContent = "Log in to get started";
      containerApp.style.opacity = 0;
    }
    time--;
    labelTimer.textContent = `${min.toString().padStart(2, 0)}:${sec
      .toString()
      .padStart(2, 0)}`;
  }, 1000);
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
    labelWelcome.textContent = `Welcome ${currAcc.owner.split(" ")[0]}!`;
    containerApp.style.opacity = 100;

    //Clear Input fields
    inputLoginPin.value = inputLoginUsername.value = "";
    inputLoginPin.blur();

    //The log out timer starts
    logOutTimer();

    // updateUI
    updateUI(currAcc);
  }
};

//Transfer money Handler
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
    setTimeout(() => {
      currAcc.movements.push(-transferAmount);

      //Adding movement date to the current account
      currAcc.movementsDates.push(new Date().toISOString());

      // The logOut timer resets
      logOutTimer();

      // Update UI
      updateUI(currAcc);

      // Transferring money to the person
      transferedAcc?.movements.push(Math.abs(transferAmount));

      //Adding movement date to transferred account
      transferedAcc?.movementsDates.push(new Date().toISOString());
    }, 2000);
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
    setTimeout(() => {
      currAcc.movements.push(loanAmount);

      //Adding movement date to the current account
      currAcc.movementsDates.push(new Date().toISOString());

      // The logout timer starts
      logOutTimer();

      updateUI(currAcc);
    }, 3000);
  }
};

//Deleting an account
const deleteAccountHandler = e => {
  e.preventDefault();
  if (timer) {
    clearInterval(timer);
  }
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

//Sorting movements
let sort = false;
const sortMovementsHandler = e => {
  e.preventDefault();
  displayMovements(currAcc, !sort);
  sort = !sort;
};

// Event handlers
btnLogin.addEventListener("click", loginHandler);
btnTransfer.addEventListener("click", transferMoneyHandler);
btnClose.addEventListener("click", deleteAccountHandler);
btnLoan.addEventListener("click", loanHandler);
btnSort.addEventListener("click", sortMovementsHandler);
