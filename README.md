A demonstration of Z3 SMT Solver in JavaScript

## Solver constraints
- Children and pets puzzle contraints can be found [here](https://woojr.com/wp-content/uploads/2018/08/kids-logic-puzzle-answers.jpg)
- Fence constraints are as follows:
    - LEFT fence side is at tile   x = 5
    - RIGHT fence side is at       x = 10
    - TOP fence side is at         y = 15
    - BOTTOM fence side is at      y = 25
    - Generating inside fence
        - must be inside the fence boundaries
        - cannot be on a fence
    - Generating on fence
        - must be on the top or left fence
    - Generating outside fence
        - must be at an x-value of 8 or greater
        - must be at an y-value of 20 or greater
        - must be outside of the fence boundaries
        - cannot be on a fence

### Next
- [ ] refactor to output (x,y) pairs
- [ ] add functionality to take constraints as inputs
- [ ] rework for use in a game engine (such as Phaser)