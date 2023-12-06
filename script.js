'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Amit Suthar',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2022-03-22T07:42:02.383Z',
    '2022-03-27T09:15:04.904Z',
    '2022-03-28T10:17:24.185Z',
    '2022-03-29T14:11:59.604Z',
    '2022-03-31T17:01:17.194Z',
    '2022-04-01T23:36:17.929Z',
    '2022-04-02T10:20:00.790Z',
  ],
  currency: 'INR',
  locale: 'hi-IN', // de-DE
};

const account2 = {
  owner: 'Lochan Suthar',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'INR',
  locale: 'gu-IN',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const loginBox = document.querySelector('.login_data');

/////////////////////////////////////////////////
// Functions
const formatMovementDate = function (date, locale) {
  //generating yesterday today  instead of dates
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));

  const daypassed = calcDaysPassed(new Date(), date);
  console.log(daypassed);

  if (daypassed === 0) return 'today';
  if (daypassed === 1) return 'yesterday';
  if (daypassed <= 7) return `${daypassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

//function for regional currency seprator
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);
    //adding seprrater region
    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1 //to start mov with serial 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div> 
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

//creating a function for logout timer
const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(Math.trunc(time % 60)).padStart(2, 0);
    //in each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;
    //decrease 1 second

    //when 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 100;
      //disabling input and buttons
      inputTransferTo.disabled = true;
      inputTransferAmount.disabled = true;
      inputLoanAmount.disabled = true;
      inputCloseUsername.disabled = true;
      inputClosePin.disabled = true;

      btnTransfer.disabled = true;
      btnLoan.disabled = true;
      btnClose.disabled = true;
    }

    time--;
  };

  //set time to 5 minute
  let time = 300;

  //call the timer every second
  tick();
  const timer = setInterval(tick, 1000); // by declaring time function seprately now it immediately  called
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;
// //Fake login
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

//internalization api experimenting
const now = new Date();
//we also add option to customize it , we have to add it next to lang-country ,(option)
const option = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
};
//to see user local manually
const locale = navigator.language;

labelDate.textContent = new Intl.DateTimeFormat(locale, option).format(now);
//here, ('en-US') first = language, second = country
//to format we have to add .format() and inside it the date
//to get all code google iso language code table

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    loginBox.style.display = 'none';

    //creating date and time using intr api #2 method after new Date()
    const option = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    //to see user local manually

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      option
    ).format(now);

    // //Create current date and time
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    ///timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    // Update UI
    updateUI(currentAccount);

    //reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);
      //add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      //reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/*
//Lecture = 03 Converting and Checking Numbers
//All numbers in JavaScript are presented internally as floating point numbers. No matter if we write them as integers or decimals.
//That’s the reason that we have only one data type for all numbers.
//Also numbers are represented internally in a 64 base 2 format.
//this means that number are stored in binary format. They are composed of 0 and 1.
//base 10 – 0 to 9. 1/10 = 0.1   3/10= 3.3333333
//binary  base 2 – 0 1

console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);
// Conversion str => number //old way
console.log(Number('23'));
//easiest way to convert a string to number
console.log(+'23'); //here javascript automaticaly do a type coersion

//parsing
console.log(Number.parseInt('803Xpx')); //it convert string to integer //useful in gettting value from css to dom  unit removed integer remain.
console.log(Number.parseInt('r803Xpx')); //but string must start with integer otherwise it skip whole string
//parseInt function also accept second argument = radix
//from radix we can define base number like if we want for binary than base = 2
console.log(Number.parseInt('15r', 10));
//there is parseFloat also
console.log(Number.parseFloat('2.5r'));
console.log(Number.parseInt('2.5r')); //here it stopper after 2 so we need parseFloat
//this two are also global function so we don't need Number.
//old skool version
console.log(parseInt('10proMAx'));

//Cheking if value is NaN
console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'20X'));
console.log(Number.isNaN(23 / 0));

//Checking if value is number
console.log(Number.isFinite(20));
console.log(Number.isFinite('20'));
console.log(Number.isFinite(+'20X'));
console.log(Number.isFinite(23 / 0));

//to check if value is integer or not
console.log(Number.isInteger(20));

//Lecture - 4 Math and Rounding

//to find square root
console.log(Math.sqrt(25)); //we checking 25 is square root of
// manually
console.log(25 ** (1 / 2)); //we checking 25 is square root of
//cubic root
console.log(8 ** (1 / 3)); //we check 8 is cubic root of
console.log(Math.cbrt(8)); //we check 8 is cubic root of

//min , max
console.log(Math.max(12, 14, 52, 84, 65, 83, 99)); //we check which is maximum
//it also has type coersion
console.log(Math.max(12, 14, 52, 84, 65, 83, '99'));
//it not parse
console.log(Math.max(12, 14, 52, 84, 65, 83, '99r'));
//min
console.log(Math.min(12, 14, 52, 84, 65, 83, 99)); //we check which is minimmum
//finding radius of circle
console.log(Math.PI * Number.parseFloat('10RS') ** 2);
//random
console.log(Math.trunc(Math.random() * 6) + 1);

//Generating randomint between min max
const randomInt = function (min, max) {
  return Math.trunc(Math.random() * (max - min) + 1) + min;
};
//0...1 => 0...(max-min) => min...max
console.log(randomInt(10, 20));

//Rounding integer
console.log(Math.trunc(803.5)); //it remove decimal

//Rounding or simply round figure me show krna
console.log(Math.round(802.6)); //The value to be rounded to the nearest integer.

//Ceil //ek bhi point jyada h to use pura count krdega ex 55.5 => 56
console.log(Math.ceil(55.5)); //Returns the smallest integer greater than or equal to its numeric argument.

//Floor //ek bhi point jyada ho to bhi count nhi krega ex 55.5 => 55
console.log(Math.floor(55.5)); //Returns the greatest integer less than or equal to its numeric argument.
//floor and trunc are work same but only diffrence is result are vary on negative value
console.log(Math.trunc(-22.5)); // -22
console.log(Math.floor(-22.5)); // -23

//Rounding the decimals
console.log((2.7).toFixed(0)); //Returns a string representing a number in fixed-point notation.
console.log(+(2.7).toFixed(0));
console.log((2.7).toFixed(2));
console.log((2.24544648).toFixed(6)); //how many digiti you want after decimal

// Lecture - 5 The Remainder Operator
//it return the remainder of a division.

console.log(5 % 2);
console.log(5 / 2); //5 = 2 * 2 + 1

console.log(8 % 3);
console.log(8 / 3); //8 = 2 * 3 + 2

console.log(6 % 2);
console.log(6 / 2);

const isEven = n => n % 2 === 0;

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 3 === 0) {
      row.style.backgroundColor = 'orangered';
    }
  });
});

// Lecture - 6 Working with BigInt
console.log(2 ** 53 - 1); //maximum number javascript can handle
console.log(Number.MAX_SAFE_INTEGER);
//because greater than this may give confusing result, not accurate
console.log(2 ** 53 + 2); //9007199254740994
console.log(2 ** 53 + 5); //9007199254740996
console.log(2 ** 53 + 6); //9007199254740998
console.log(2 ** 53 + 8); //9007199254741000

console.log(616560413204304358);
//without BigInt we result = 6.165604132043044e+31
//for BigInt we use n in ending of integer or also BigInt method
console.log(616560413204304358n);
console.log(BigInt(616560413204304358));

//operation
console.log(10000n + 10000n);
console.log(616560413204304358n * 616560413204304358n);

//mixing BigInt with regular number is not possible, we get a error
const huge = 314321654611461654303131n;
const regular = 25;
// console.log(huge + regular);
///Uncaught TypeError: Cannot mix BigInt and other types, use explicit conversions
//to make it work
console.log(huge + BigInt(regular));  //both needs to BigInt

//exception
console.log(20n > 15);
console.log(20n === 20); //false because strict equality operator does'nt do type coersion
console.log(typeof 20n);
console.log(typeof 20);
console.log(20n == 20); //true because of loose quality operator
//string concatination is also a exception
console.log(10n / 3n);

// Lecture - 7 Creating Dates

//there are 4 ways to create date in javascript
//#1
const now = new Date();
console.log(now); //it return current date time etc

console.log(new Date('mar 10 2000'));
console.log(new Date('14 march'));
console.log(new Date(account1.movementsDates[0]));
console.log(new Date(2077, 10, 30));
console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000));
//new Date is a just another special type of object so. they have own methods

//working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear()); //it return the year 
//there is year method also but don't use that always use fullyear
console.log(future.getMonth()); //it return the month but zero based 10 = 11 nov ,or + 1
console.log(future.getDate()); // it return current day here, 19
console.log(future.getDay()); // it return day no. here, 4 = thu 0 = sun
console.log(future.getHours()); //Gets the hours in a date, using local time.
console.log(future.getMinutes());//Gets the minutes of a Date object, using local time
console.log(future.getSeconds());//Gets the seconds of a Date object, using local time

console.log(future.toISOString()); //Returns a date as a string value in ISO format. 
//ISO = international standard
//timestamp is the milliseconds passed which has passed since january 1, 1970
console.log(future.getTime()); // Gets the time value in milliseconds.
//to get date from timestamp based on this milliseconds
console.log(new Date(2142237180000));
//if we want current time stamp
console.log(Date.now());
console.log(new Date(1648970942305));
//also we have set year
future.setFullYear(2077);
console.log(future);

//toFixed() -Returns a string representing a number in fixed-point notation.

// Lecture -10 Internationalizing Dates (Intl)

//it allows us to easily format numbers and strings according to diffrent languages
//internalization api experimenting
const now = new Date();
//we also add option to customize it , we have to add it next to lang-country ,(option)
const option = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric', //we also have '2-digit' //2022 = 22
  hour: 'numeric',
  minute: 'numeric',
}

labelDate.textContent = new Intl.DateTimeFormat('hi-IN',option).format(now)
//here, ('en-US') first = language, second = country 
//to format we have to add .format() and inside it the date
//to get all code google iso language code table

//to see user local manually
const locale = navigator.language;
//when you only need Date you don't need to write option
  return new Intl.DateTimeFormat(locale).format(date);

*/

// Lecture -11 Internationalizing Numbers (Intl)

const num = 50000;
//here, we also have options object
const options = {
  style: 'currency', //we have unit, percentage,currency
  currency: 'INR',
  // useGrouping: false // it return number without seprator if set to false
};

//it format number seprator accourding to language or region.
console.log('india', new Intl.NumberFormat('hi-IN', options).format(num)); //here, we use india
//result is 50,000
console.log('Syria', new Intl.NumberFormat('ar-SY').format(num)); //here, we use syria
//result  ٥٠٬٠٠٠
console.log(new Intl.NumberFormat('de-DE').format(num)); //here, we use Germany
//and for accourding to browser or user locallity
console.log(new Intl.NumberFormat(navigator.language).format(num)); //here, we use user locallity

// Lecture -12 Timers_ setTimeout and setInterval
/* We have two types of timers 
1. settimeout timer = runs just once after a define time, it also take callback function,
first argument is function and 2nd is timer in millisecond,
 1sec = 1000 milisecond, and callback function only executed once 
--------------------------------------------------------------------
2. setinterval timer = keeps running forever, until we stop it.
 we use this when we neen an function to call again and again after specific time.
*/

setTimeout(() => console.log('Hello amit'), 1000);
//here, it will print 'Hello amit ' after 5 second.
// we delay the function according the time.
//we simply schedule the function for later

//if we want to pass argument, then we have two define after timeout,

setTimeout(
  (msg1, msg2) => {
    console.log(msg1, msg2);
  },
  3000,
  'i am msg1 as argument 1', //arg1
  'i am msg2 as argument 2' //arg2
);

//if we want to stop the timeout, then we have to do something like this
const ingredients = ['olives', 'cheese'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => {
    console.log(`Here is your pizza with ${ing1} and ${ing2} 🍕`);
  },
  5000,
  ...ingredients
);
console.log('Waiting...');
//we use clearTimeout()
if (ingredients.includes('butter')) {
  clearTimeout(pizzaTimer);
  console.log('ingredients contain avoiding item');
}

//setinterval
// setInterval(function(){
//  const now = new Date();
//  console.log(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
// },1000)
