// const sumArray = (a: string | any[]rr1, a: string | any[]rr2) => {
//   const maxLength = Math.max(arr1.length, arr2.length);
//   if (maxLength > 2) return;
//   const minLength = Math.min(arr1.length, arr2.length);
//   const result = [];
//   for (let i = 0; i < maxLength; i++) {
//     const sum =
//       (arr1[i] || arr1[minLength - 1]) + (arr2[i] || arr2[minLength - 1]);
//     result.push(sum);
//   }
//   return result;
// };

import { sumArray } from "@/utils/string";

// const prices = [
//   { id: "eb5df333-887f-422c-934a-239c0abbd468", price: [100, 200] },
//   { id: "eb5df333-887f-422c-934a-239c0abbd468", price: [0] },
//   { id: "eb5df333-887f-422c-934a-239c0abbd468", price: [0, 20] },
//   { id: "eb5df333-887f-422c-934a-239c0abbd468", price: [100, 200] },
//   { id: "eb5df333-887f-422c-934a-239c0abbd468", price: [0] },
//   { id: "eb5df333-887f-422c-934a-239c0abbd468", price: [0, 20] },
//   { id: "855efdad-ee21-461b-8735-c7c7b55e551e", price: [100, 200] },
//   { id: "855efdad-ee21-461b-8735-c7c7b55e551e", price: [50, 100] },
//   { id: "855efdad-ee21-461b-8735-c7c7b55e551e", price: [0, 20] },
//   { id: "855efdad-ee21-461b-8735-c7c7b55e551e", price: [100, 200] },
//   { id: "855efdad-ee21-461b-8735-c7c7b55e551e", price: [50, 100] },
//   { id: "855efdad-ee21-461b-8735-c7c7b55e551e", price: [0, 20] },
// ];

// const groupedPrices = prices.reduce((acc, curr) => {
//   if (acc[curr.id]) {
//     // Use the sumArray function to combine the price arrays
//     acc[curr.id].price = sumArray(acc[curr.id].price, curr.price);
//   } else {
//     // If the id doesn't exist, initialize it with the current price
//     acc[curr.id] = { id: curr.id, price: curr.price };
//   }
//   return acc;
// }, {});

// // Convert the grouped object back to an array
// const result = Object.values(groupedPrices);

// console.log(result);

const items = [
  {
    id: 1,
    price: [100, 200],
  },
  {
    id: 2,
    price: [10, 20],
  },
  {
    id: 3,
    price: [40],
  },
];

const result = items.reduce(
  (prev, curr) => {
    return { price: sumArray(prev.price, curr.price) };
  },
  { price: [0, 0] }
);
console.log("result:", result);
