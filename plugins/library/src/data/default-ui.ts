import type { ComponentSnippet } from '../types';

export const DEFAULT_COMPONENTS: ComponentSnippet[] = [
  {
    id: 'btn-primary',
    name: 'Primary Button',
    category: 'Elements',
    html: `<button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition duration-150 ease-in-out">
  Click Me
</button>`,
  },
  {
    id: 'btn-secondary',
    name: 'Secondary Button',
    category: 'Elements',
    html: `<button class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded shadow transition duration-150 ease-in-out">
  Click Me
</button>`,
  },
  {
    id: 'card-basic',
    name: 'Basic Card',
    category: 'Cards',
    html: `<div class="max-w-sm rounded overflow-hidden shadow-lg bg-white border border-gray-200">
  <div class="px-6 py-4">
    <div class="font-bold text-xl mb-2 text-gray-900">Card Title</div>
    <p class="text-gray-700 text-base">
      Some quick example text to build on the card title and make up the bulk of the card's content.
    </p>
  </div>
  <div class="px-6 pt-4 pb-2">
    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#photography</span>
  </div>
</div>`,
  },
  {
    id: 'alert-success',
    name: 'Success Alert',
    category: 'Feedback',
    html: `<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
  <strong class="font-bold">Success!</strong>
  <span class="block sm:inline">Something happened successfully.</span>
</div>`,
  },
  {
    id: 'alert-error',
    name: 'Error Alert',
    category: 'Feedback',
    html: `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
  <strong class="font-bold">Error!</strong>
  <span class="block sm:inline">Something went wrong.</span>
</div>`,
  },
  {
    id: 'input-text',
    name: 'Text Input',
    category: 'Forms',
    html: `<input type="text" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Enter text...">`,
  },
  {
    id: 'navbar-basic',
    name: 'Basic Navbar',
    category: 'Navigation',
    html: `<nav class="bg-gray-800 text-white p-4">
  <div class="flex justify-between items-center">
    <div class="font-bold text-xl">Logo</div>
    <div class="flex gap-4">
      <a href="#" class="hover:text-gray-300">Home</a>
      <a href="#" class="hover:text-gray-300">About</a>
      <a href="#" class="hover:text-gray-300">Contact</a>
    </div>
  </div>
</nav>`,
  },
];

