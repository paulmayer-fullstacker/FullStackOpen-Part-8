# Development Comments

## Exercise 8.20.

After experiancing problems rendering the recommended/favourite books, I placed sequencial validation in the recommend logic to isolate the bug.
Having fixed the problem, I realised that the validation logic was inconsistent, with its own intermitent/phantom bug. The validation logic was not a requirement of the exercise. So, the easy solution was to simply removed that redundant code.

The commented code for the difficult solution can be found at src/components/Recommend.jsx lines 05-51
See specifically lines 8 and 13
