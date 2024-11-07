import { init } from 'z3-solver';

const { Context } = await init();
const { Solver, Int, And, Or, Distinct } = new Context("main");

/*********************************************************************************
/   CHILDREN AND PETS PUZZLE
/   > https://woojr.com/wp-content/uploads/2018/08/kids-logic-puzzle-answers.jpg 
/********************************************************************************/
function checkOutput(arr1, arr2){
    if(arr1.length !== arr2.length) return false;
    if(arr1.sort().join(',') !== arr2.sort().join(',')) return false;
    return true;
};

console.log("CHILDREN AND PETS PUZZLE");

// 1 (CAT), 2 (DOG), 3 (BIRD), 4 (FISH)

const bob = Int.const("bob");
const mary = Int.const("mary");
const cathy = Int.const("cathy");
const sue = Int.const("sue");

const puzzle_solver = new Solver();

puzzle_solver.add(
    And(
        cathy.le(4),   
        cathy.ge(1),    //  > values [1, 4]
        cathy.neq(bob), //  > must be different than the others
        cathy.neq(mary), 
        cathy.neq(sue)  
    ),
    And(
        mary.lt(4),     // mary does not have a fish
        mary.ge(1),     //  > values [1, 4)
        mary.neq(bob),  //  > must be different than the others
        mary.neq(sue), 
        mary.neq(cathy) 
    ),
    bob.eq(2),          // the boy has a dog
    sue.eq(3)           // sue has a pet with 2 legs
);  

let puzzle_check = puzzle_solver.check();
console.log(await puzzle_check);

const puzzle_model = puzzle_solver.model();

const bob_val = puzzle_model.eval(bob);
const mary_val = puzzle_model.eval(mary);
const cathy_val = puzzle_model.eval(cathy);
const sue_val = puzzle_model.eval(sue);

console.log(` > bob: ${bob_val}\n > mary: ${mary_val}\n > cathy: ${cathy_val}\n > sue: ${sue_val}`);

// testing
const expectedOutput =  [ `2`,  `1`,   `4`, `3` ]; 
const actualOutput = [`${bob_val}`, `${mary_val}`, `${cathy_val}`, `${sue_val}`];
console.log(checkOutput(expectedOutput, actualOutput) ? "PASSED\n" : "FAILED\n");

/*********************************************************************************
/   REPRESENT GAME CONSTRAINTS
/********************************************************************************/

function randomRange(min, max, mult){    // min and max are inclusive
    if(min == null){ 
        min = Math.ceil(Math.random() * mult); 
        if(max !== null){
            while(min === max || min > max){ max = Math.ceil(Math.random() * mult); }
        }
    }
    if(max === null){ 
        max = Math.ceil(Math.random() * mult); 
        while(min === max || min > max){ max = Math.ceil(Math.random() * mult); 
        }
    }
    
    let [min_ceil, max_ceil] = [Math.ceil(min), Math.ceil(max)];
    
    let a = Math.floor(Math.random() * (max_ceil - min_ceil + 1) + min_ceil);
    let b = Math.floor(Math.random() * (max_ceil - min_ceil + 1) + min_ceil);
    
    while(a === b){ 
        b = Math.floor(Math.random() * (max_ceil - min_ceil + 1) + min_ceil);
    }
    
    if(a < b){ return [a, b]; }
    else{ return [b, a]; }
};

function randomInRange(min, max){    // min and max are inclusive
    let [min_ceil, max_ceil] = [Math.ceil(min), Math.ceil(max)];
    
    return Math.floor(Math.random() * (max_ceil - min_ceil + 1) + min_ceil);
};

function checkOutputRange([x, y], [l, r], [t, b], enforceBounds){
    if(x < l || x > r || y < t || y > b){ return false; }

    if(enforceBounds){ // check that x or y is equal to a boundary
        if(x != l && x != r && y != t && y != b){ 
            return false; 
        }
    }

    return true;
};

// LEFT fence side is at tile   x = 5
// RIGHT fence side is at       x = 10
// TOP fence side is at         y = 15
// BOTTOM fence side is at      y = 25

const [left, right] = [5, 10];
const [top, bottom] = [15, 25];

const [x, y] = [Int.const("x"), Int.const("y")];

const MULTIPLIER = 100;

/***** GENERATE INSIDE FENCE ****************************************************/
console.log("GENERATE INSIDE FENCE");

const inside_fence_solver = new Solver();

let [x_min, x_max] = randomRange(left, right);
let [y_min, y_max] = randomRange(top, bottom);

inside_fence_solver.add( 
    And(
        x.ge(x_min), 
        x.le(x_max),
        x.neq(left),
        x.neq(right)
    ) 
);
inside_fence_solver.add( 
    And(
        y.ge(y_min), 
        y.le(y_max),
        y.neq(top),
        y.neq(bottom)
    ) 
);

let inside_fence_check = inside_fence_solver.check();
console.log(await inside_fence_check);

const inside_fence_model = inside_fence_solver.model();

let x_val = inside_fence_model.eval(x);
let y_val = inside_fence_model.eval(y);

console.log(` > (x, y): (${x_val}, ${y_val})`);

//test
console.log(
    checkOutputRange(
        [`${x_val}`, `${y_val}`], 
        [left, right], 
        [top, bottom]
    ) ? "PASSED\n" : "FAILED\n"
);

/***** GENERATE ON FENCE ********************************************************/
console.log("GENERATE ON FENCE");

const on_fence_solver = new Solver();

[x_min, x_max] = randomRange(left, right);
[y_min, y_max] = randomRange(top, bottom);

on_fence_solver.add( 
    Or(
        And(
            Or(x.eq(left), x.eq(right)),
            And(y.ge(y_min), y.le(y_max))
        ),
        And(
            Or(y.eq(top), y.eq(bottom)),
            And(x.ge(x_min), x.le(x_max))
        )
    )
);

let on_fence_check = on_fence_solver.check();
console.log(await on_fence_check);

const on_fence_model = on_fence_solver.model();

x_val = on_fence_model.eval(x);
y_val = on_fence_model.eval(y);

console.log(` > (x, y): (${x_val}, ${y_val})`);

//test
console.log(
    checkOutputRange(
        [`${x_val}`, `${y_val}`], 
        [left, right], 
        [top, bottom],
        true
    ) ? "PASSED\n" : "FAILED\n"
);

/***** GENERATE OUTSIDE FENCE ***************************************************/
console.log("GENERATE OUTSIDE FENCE");

const outside_fence_solver = new Solver();

let outside_x_min = 8;  // must be at a x value of 8 or greater...
let outside_y_min = 20; // ...and a y value of 20 or greater

[x_min, x_max] = randomRange(outside_x_min, null, MULTIPLIER); 
[y_min, y_max] = randomRange(outside_y_min, null, MULTIPLIER); 

outside_fence_solver.add( 
    And(
        x.ge(x_min), 
        x.ge(outside_x_min),        
        x.le(x_max),
        x.neq(left),
        x.neq(right)
    ) 
);
outside_fence_solver.add( 
    And(
        y.ge(y_min),
        y.ge(outside_y_min),        
        y.le(y_max),
        y.neq(top),
        y.neq(bottom)
    ) 
);

let ouside_fence_check = outside_fence_solver.check();
console.log(await ouside_fence_check);

const outside_fence_model = outside_fence_solver.model();

x_val = outside_fence_model.eval(x);
y_val = outside_fence_model.eval(y);

console.log(` > (x, y): (${x_val}, ${y_val})`);

//test
console.log(
    checkOutputRange(
        [`${x_val}`, `${y_val}`], 
        [outside_x_min, Number.INFINITY], 
        [outside_y_min, Number.INFINITY],
    ) ? "PASSED\n" : "FAILED\n"
);