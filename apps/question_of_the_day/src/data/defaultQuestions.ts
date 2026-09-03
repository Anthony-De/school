export type QuestionBankEntry = readonly [string, readonly string[]];

export const DEFAULT_QUESTION_BANK = {
  Favorites: [
    ['What is your favorite color?', ['Red', 'Blue', 'Green', 'Purple']],
    ['What is your favorite season?', ['Spring', 'Summer', 'Fall', 'Winter']],
    [
      'What is your favorite kind of animal?',
      ['Dogs', 'Cats', 'Wild animals', 'Farm animals']
    ],
    [
      'What is your favorite fruit?',
      ['Apples', 'Bananas', 'Berries', 'Oranges']
    ],
    [
      'What is your favorite snack?',
      ['Fruit', 'Crackers', 'Cheese', 'Something sweet']
    ],
    [
      'What is your favorite school subject?',
      ['Reading', 'Math', 'Science', 'Art']
    ],
    [
      'What is your favorite recess activity?',
      ['Playground', 'Ball games', 'Running', 'Talking with friends']
    ],
    [
      'What kind of books do you like best?',
      ['Funny', 'Adventure', 'Animal', 'Fact books']
    ],
    ['What weather do you like best?', ['Sunny', 'Rainy', 'Snowy', 'Windy']],
    [
      'What is your favorite holiday activity?',
      ['Decorating', 'Cooking', 'Games', 'Visiting family']
    ],
    [
      'What is your favorite pizza topping?',
      ['Cheese', 'Pepperoni', 'Vegetables', 'Something else']
    ],
    [
      'What is your favorite ice cream flavor?',
      ['Chocolate', 'Vanilla', 'Strawberry', 'Something else']
    ],
    ['What music do you like best?', ['Fast', 'Slow', 'Silly', 'Calm']],
    [
      'What is your favorite art material?',
      ['Crayons', 'Markers', 'Paint', 'Clay']
    ],
    [
      'What playground equipment do you like best?',
      ['Swings', 'Slide', 'Climbing bars', 'Open field']
    ],
    [
      'What is your favorite breakfast?',
      ['Cereal', 'Eggs', 'Pancakes', 'Fruit']
    ],
    [
      'What is your favorite drink?',
      ['Water', 'Milk', 'Juice', 'Something else']
    ],
    ['Which pet would you most like?', ['Dog', 'Cat', 'Fish', 'Small animal']],
    [
      'What sport do you like best?',
      ['Soccer', 'Basketball', 'Baseball', 'Swimming']
    ],
    [
      'Where is your favorite place to read?',
      ['Bed', 'Couch', 'Classroom', 'Outside']
    ]
  ],
  'Would You Rather': [
    ['Would you rather fly or be invisible?', ['Fly', 'Be invisible']],
    [
      'Would you rather visit space or the deep ocean?',
      ['Space', 'Deep ocean']
    ],
    [
      'Would you rather have a pet dinosaur or a pet dragon?',
      ['Dinosaur', 'Dragon']
    ],
    [
      'Would you rather live in a treehouse or a castle?',
      ['Treehouse', 'Castle']
    ],
    ['Would you rather be very fast or very strong?', ['Fast', 'Strong']],
    [
      'Would you rather talk to animals or understand every language?',
      ['Talk to animals', 'Every language']
    ],
    [
      'Would you rather have a snow day or a beach day?',
      ['Snow day', 'Beach day']
    ],
    ['Would you rather explore a jungle or a cave?', ['Jungle', 'Cave']],
    [
      'Would you rather eat only sweet food or only salty food for a day?',
      ['Sweet', 'Salty']
    ],
    ['Would you rather ride a horse or a dolphin?', ['Horse', 'Dolphin']],
    [
      'Would you rather be tiny as an ant or tall as a giraffe?',
      ['Tiny', 'Tall']
    ],
    ['Would you rather build a robot or a rocket?', ['Robot', 'Rocket']],
    ['Would you rather sleep in a tent or a cabin?', ['Tent', 'Cabin']],
    ['Would you rather have wings or a tail?', ['Wings', 'Tail']],
    ['Would you rather make art or make music?', ['Art', 'Music']],
    ['Would you rather read a story or watch a story?', ['Read', 'Watch']],
    ['Would you rather play inside or outside?', ['Inside', 'Outside']],
    [
      'Would you rather meet a superhero or a famous inventor?',
      ['Superhero', 'Inventor']
    ],
    ['Would you rather have a magic wand or magic shoes?', ['Wand', 'Shoes']],
    [
      'Would you rather discover a new animal or a new planet?',
      ['Animal', 'Planet']
    ]
  ],
  'Morning Meeting': [
    [
      'How are you feeling this morning?',
      ['Great', 'Good', 'Okay', 'Not so good']
    ],
    [
      'How much energy do you have today?',
      ['Lots', 'Some', 'A little', 'Very little']
    ],
    [
      'How ready are you to learn?',
      ['Very ready', 'Almost ready', 'Need a minute', 'Need help']
    ],
    [
      'What would help you have a good day?',
      ['A challenge', 'A friend', 'Quiet time', 'Encouragement']
    ],
    [
      'How did you sleep last night?',
      ['Very well', 'Pretty well', 'Not much', 'Not sure']
    ],
    [
      'What kind of day do you hope to have?',
      ['Exciting', 'Calm', 'Creative', 'Friendly']
    ],
    [
      'How do you want to help the class today?',
      ['Be kind', 'Work hard', 'Listen', 'Share']
    ],
    [
      'What are you most excited for today?',
      ['Learning', 'Recess', 'Lunch', 'Seeing friends']
    ],
    [
      'What should our class focus on today?',
      ['Kindness', 'Listening', 'Effort', 'Teamwork']
    ],
    [
      'How do you like to begin your morning?',
      ['Talking', 'Reading', 'Drawing', 'Quiet thinking']
    ],
    [
      'What makes you feel welcome at school?',
      ['A smile', 'A greeting', 'A friend', 'A calm space']
    ],
    [
      'What is one goal for today?',
      ['Finish my work', 'Help someone', 'Try something hard', 'Stay focused']
    ],
    ['Which word fits your morning?', ['Happy', 'Sleepy', 'Curious', 'Busy']],
    [
      'How would you like today to feel?',
      ['Fun', 'Peaceful', 'Interesting', 'Successful']
    ],
    [
      'What can you bring to our class today?',
      ['Ideas', 'Kindness', 'Energy', 'Patience']
    ],
    [
      'What are you ready to practice?',
      ['Reading', 'Math', 'Listening', 'Being brave']
    ],
    [
      'How connected do you feel to the class today?',
      ['Very connected', 'Connected', 'A little separate', 'Need a friend']
    ],
    [
      'What kind of break would help today?',
      ['Movement', 'Quiet', 'Fresh air', 'A snack']
    ],
    [
      'How confident do you feel today?',
      ['Very confident', 'Mostly confident', 'Unsure', 'Need support']
    ],
    [
      'What is worth celebrating today?',
      ['I came prepared', 'I tried', 'I helped', 'I learned']
    ]
  ],
  'Feelings & Friendship': [
    [
      'What can you do when a friend feels sad?',
      ['Listen', 'Invite them to play', 'Get an adult', 'All of these']
    ],
    [
      'What is a good way to join a game?',
      ['Ask politely', 'Grab the ball', 'Shout', 'Walk away']
    ],
    [
      'What should you do if you make a mistake?',
      ['Try again', 'Hide it', 'Blame someone', 'Give up']
    ],
    [
      'How can you calm down when upset?',
      ['Take breaths', 'Count slowly', 'Ask for space', 'Any of these']
    ],
    [
      'What makes someone a good friend?',
      ['Kindness', 'Listening', 'Sharing', 'All of these']
    ],
    [
      'What can you say when you disagree?',
      ['I see it differently', 'You are wrong', 'Stop talking', 'Nothing']
    ],
    [
      'What should you do if someone is left out?',
      ['Invite them', 'Ignore them', 'Laugh', 'Walk away']
    ],
    [
      'How can you show respect?',
      ['Listen', 'Use kind words', 'Take turns', 'All of these']
    ],
    [
      'What can you do when work feels hard?',
      ['Ask for help', 'Take a break', 'Try a new way', 'All of these']
    ],
    [
      'How should you respond to an apology?',
      ['Listen', 'Decide when ready', 'Use calm words', 'All of these']
    ],
    [
      'What is one way to be responsible?',
      ['Do your job', 'Lose supplies', 'Interrupt', 'Skip directions']
    ],
    [
      'What helps solve a problem with a friend?',
      ['Calm talking', 'Yelling', 'Pushing', 'Ignoring forever']
    ],
    [
      'How can you show gratitude?',
      ['Say thank you', 'Write a note', 'Help back', 'All of these']
    ],
    [
      'What should you do when someone says stop?',
      ['Stop', 'Keep going', 'Laugh', 'Argue']
    ],
    [
      'What is a brave choice?',
      ['Trying something new', 'Never asking help', 'Pretending', 'Giving up']
    ],
    [
      'How can you be a good partner?',
      ['Take turns', 'Share ideas', 'Listen', 'All of these']
    ],
    [
      'What can you do if you feel lonely?',
      [
        'Ask to join',
        'Talk to an adult',
        'Find a kind classmate',
        'All of these'
      ]
    ],
    [
      'What does fairness mean?',
      [
        'Everyone gets what they need',
        'Everyone always gets the same',
        'I always go first',
        'No rules'
      ]
    ],
    [
      'How can you help after hurting someone’s feelings?',
      ['Apologize', 'Listen', 'Make a better choice', 'All of these']
    ],
    [
      'Which classroom habit helps everyone?',
      ['Raising a hand', 'Listening', 'Cleaning up', 'All of these']
    ]
  ],
  'Reading & Words': [
    [
      'Which word begins with the same sound as sun?',
      ['Sock', 'Moon', 'Pig', 'Cat']
    ],
    ['Which word rhymes with cat?', ['Hat', 'Cup', 'Dog', 'Sun']],
    ['Which word begins with B?', ['Ball', 'Fish', 'Moon', 'Top']],
    ['Which word rhymes with log?', ['Frog', 'Leaf', 'Bike', 'Pen']],
    ['Which word has the short A sound?', ['Map', 'Moon', 'Seed', 'Rope']],
    ['Which word has the short I sound?', ['Fish', 'Cake', 'Boat', 'Cube']],
    ['Which word ends with T?', ['Cat', 'Dog', 'Sun', 'Map']],
    ['Which word begins with a vowel?', ['Apple', 'Ball', 'Cat', 'Dog']],
    ['Which word names a person?', ['Teacher', 'School', 'Run', 'Blue']],
    ['Which word names a place?', ['Park', 'Jump', 'Happy', 'Pencil']],
    ['Which word is an action?', ['Run', 'Yellow', 'Table', 'Soft']],
    ['Which word describes something?', ['Tiny', 'Dog', 'Hop', 'School']],
    [
      'Which mark ends a question?',
      ['Question mark', 'Period', 'Comma', 'Exclamation mark']
    ],
    [
      'Which word should begin with a capital letter?',
      ['Monday', 'apple', 'jump', 'green']
    ],
    [
      'Which is a complete sentence?',
      ['The dog runs.', 'Dog the', 'Running fast', 'The red']
    ],
    ['Which word has two syllables?', ['Rabbit', 'Cat', 'Fish', 'Book']],
    ['Which word is the opposite of hot?', ['Cold', 'Warm', 'Big', 'Fast']],
    [
      'Which word means almost the same as happy?',
      ['Glad', 'Angry', 'Tired', 'Slow']
    ],
    [
      'What part of a book tells its name?',
      ['Title', 'Page number', 'Picture', 'Back cover']
    ],
    [
      'Who creates the pictures in a book?',
      ['Illustrator', 'Author', 'Reader', 'Character']
    ]
  ],
  Math: [
    ['What is 2 + 3?', ['4', '5', '6', '7']],
    ['What is 5 + 4?', ['7', '8', '9', '10']],
    ['What is 7 - 2?', ['3', '4', '5', '6']],
    ['What is 10 - 3?', ['6', '7', '8', '9']],
    ['Which number is greatest?', ['3', '7', '5', '2']],
    ['Which number is smallest?', ['9', '4', '6', '8']],
    ['What number comes after 12?', ['11', '13', '14', '15']],
    ['What number comes before 20?', ['18', '19', '21', '22']],
    ['How many sides does a triangle have?', ['2', '3', '4', '5']],
    ['How many sides does a square have?', ['3', '4', '5', '6']],
    [
      'Which shape has no corners?',
      ['Circle', 'Triangle', 'Square', 'Rectangle']
    ],
    [
      'Which object is usually measured in inches?',
      ['Pencil', 'Playground', 'Town', 'Cloud']
    ],
    ['Which holds more?', ['Bucket', 'Cup', 'Spoon', 'Bottle cap']],
    ['Which is longer?', ['School bus', 'Crayon', 'Paper clip', 'Eraser']],
    ['What is 1 more than 8?', ['7', '8', '9', '10']],
    ['What is 1 less than 15?', ['13', '14', '15', '16']],
    ['Which pair makes 10?', ['4 and 6', '2 and 5', '3 and 4', '1 and 7']],
    ['How many tens are in 30?', ['1', '2', '3', '4']],
    ['Which coin is worth 5 cents?', ['Nickel', 'Penny', 'Dime', 'Quarter']],
    [
      'Which time is in the morning?',
      ['8:00 AM', '8:00 PM', 'Midnight', 'Noon']
    ]
  ],
  'Science & Nature': [
    [
      'What do plants need to grow?',
      ['Sunlight', 'Water', 'Air', 'All of these']
    ],
    [
      'Which part of a plant is usually underground?',
      ['Roots', 'Flower', 'Leaf', 'Fruit']
    ],
    ['What do we use to see?', ['Eyes', 'Ears', 'Nose', 'Hands']],
    ['What do we use to hear?', ['Ears', 'Eyes', 'Tongue', 'Feet']],
    [
      'Which material is attracted to a magnet?',
      ['Iron', 'Wood', 'Plastic', 'Paper']
    ],
    [
      'What happens to ice when it gets warm?',
      ['It melts', 'It freezes', 'It grows', 'It disappears']
    ],
    ['Which is a source of light?', ['Sun', 'Moon', 'Rock', 'Tree']],
    ['What makes a shadow?', ['Light being blocked', 'Sound', 'Wind', 'Water']],
    [
      'Which weather tool measures temperature?',
      ['Thermometer', 'Ruler', 'Scale', 'Clock']
    ],
    ['What falls from clouds?', ['Rain', 'Sunlight', 'Rocks', 'Leaves']],
    [
      'Which season is usually coldest?',
      ['Winter', 'Spring', 'Summer', 'Fall']
    ],
    [
      'What do many animals do when seasons change?',
      ['Migrate', 'Turn into plants', 'Stop eating forever', 'Glow']
    ],
    ['Which is living?', ['Tree', 'Rock', 'Chair', 'Pencil']],
    ['Which is nonliving?', ['Rock', 'Bird', 'Flower', 'Ant']],
    ['What covers most of Earth?', ['Water', 'Sand', 'Grass', 'Buildings']],
    ['Where does the Sun appear to rise?', ['East', 'West', 'North', 'South']],
    ['What can push a sailboat?', ['Wind', 'Shadow', 'Sound', 'Darkness']],
    [
      'Which sense helps identify a flower’s scent?',
      ['Smell', 'Sight', 'Hearing', 'Touch']
    ],
    [
      'What happens when you push a toy car?',
      ['It moves', 'It melts', 'It grows', 'It sleeps']
    ],
    [
      'Which object will probably float?',
      ['Beach ball', 'Rock', 'Coin', 'Brick']
    ]
  ],
  Animals: [
    [
      'Which animal lives in the ocean?',
      ['Dolphin', 'Lion', 'Horse', 'Chicken']
    ],
    ['Which animal has feathers?', ['Bird', 'Dog', 'Fish', 'Frog']],
    ['Which animal has scales?', ['Fish', 'Rabbit', 'Bear', 'Duck']],
    ['Which animal is an insect?', ['Butterfly', 'Spider', 'Worm', 'Snail']],
    [
      'Which animal carries its baby in a pouch?',
      ['Kangaroo', 'Penguin', 'Elephant', 'Tiger']
    ],
    [
      'Which animal is known for a long neck?',
      ['Giraffe', 'Zebra', 'Lion', 'Hippo']
    ],
    [
      'Which animal can change color to hide?',
      ['Chameleon', 'Horse', 'Cow', 'Eagle']
    ],
    ['Which animal builds a dam?', ['Beaver', 'Fox', 'Deer', 'Owl']],
    [
      'Which animal is awake mostly at night?',
      ['Owl', 'Robin', 'Butterfly', 'Squirrel']
    ],
    [
      'Which animal starts life as a tadpole?',
      ['Frog', 'Snake', 'Mouse', 'Bird']
    ],
    ['Which animal has eight legs?', ['Spider', 'Ant', 'Crab', 'Beetle']],
    ['Which animal makes honey?', ['Bee', 'Fly', 'Moth', 'Grasshopper']],
    ['Which farm animal gives us wool?', ['Sheep', 'Pig', 'Chicken', 'Horse']],
    [
      'Which animal is the largest?',
      ['Blue whale', 'Elephant', 'Giraffe', 'Bear']
    ],
    [
      'Which animal moves very slowly?',
      ['Sloth', 'Cheetah', 'Horse', 'Rabbit']
    ],
    ['Which animal uses echolocation?', ['Bat', 'Eagle', 'Cat', 'Turtle']],
    [
      'Where does a polar bear live?',
      ['Arctic', 'Desert', 'Rainforest', 'Grassland']
    ],
    ['What does an herbivore eat?', ['Plants', 'Only meat', 'Rocks', 'Metal']],
    ['Which animal hatches from an egg?', ['Chicken', 'Dog', 'Cat', 'Horse']],
    [
      'Which animal would you most like to learn about?',
      ['Ocean animal', 'Jungle animal', 'Desert animal', 'Arctic animal']
    ]
  ],
  Food: [
    ['Which food is a fruit?', ['Apple', 'Carrot', 'Cheese', 'Bread']],
    ['Which food is a vegetable?', ['Broccoli', 'Banana', 'Yogurt', 'Rice']],
    ['Which food is made from milk?', ['Cheese', 'Apple', 'Bread', 'Chicken']],
    [
      'Which food is usually eaten with a spoon?',
      ['Soup', 'Sandwich', 'Pizza', 'Apple']
    ],
    [
      'Which is a healthy drink choice?',
      ['Water', 'Soda', 'Milkshake', 'Syrup']
    ],
    ['Which food is crunchy?', ['Carrot', 'Yogurt', 'Soup', 'Pudding']],
    ['Which food grows on a tree?', ['Apple', 'Potato', 'Carrot', 'Peanut']],
    ['Which food grows underground?', ['Potato', 'Orange', 'Corn', 'Apple']],
    [
      'Which meal comes first in the day?',
      ['Breakfast', 'Lunch', 'Dinner', 'Dessert']
    ],
    [
      'Which food would you pack for a picnic?',
      ['Sandwich', 'Soup bowl', 'Ice cream cone', 'Hot oatmeal']
    ],
    [
      'What would you put in a fruit salad?',
      ['Berries', 'Cheese', 'Chicken', 'Bread']
    ],
    [
      'Which topping belongs on a taco?',
      ['Lettuce', 'Syrup', 'Jelly', 'Cereal']
    ],
    [
      'Which food is usually baked?',
      ['Bread', 'Lettuce', 'Milk', 'Watermelon']
    ],
    ['Which food comes from grain?', ['Rice', 'Egg', 'Cheese', 'Fish']],
    ['Which food has a peel?', ['Banana', 'Cracker', 'Cheese', 'Rice']],
    ['What flavor do you like best?', ['Sweet', 'Salty', 'Sour', 'Savory']],
    ['Which lunch would you choose?', ['Sandwich', 'Salad', 'Soup', 'Pasta']],
    [
      'Which snack would you make?',
      ['Trail mix', 'Fruit cup', 'Toast', 'Vegetable sticks']
    ],
    [
      'What would you like to learn to cook?',
      ['Breakfast', 'Soup', 'Bread', 'Dessert']
    ],
    [
      'Which new food would you be willing to try?',
      ['New fruit', 'New vegetable', 'New grain', 'New cheese']
    ]
  ],
  'Seasons & Celebrations': [
    [
      'What do you like best about spring?',
      ['Flowers', 'Rain', 'Warmer days', 'Baby animals']
    ],
    [
      'What do you like best about summer?',
      ['Swimming', 'Sunshine', 'Vacation', 'Long days']
    ],
    [
      'What do you like best about fall?',
      ['Leaves', 'Cool air', 'Pumpkins', 'Harvest']
    ],
    [
      'What do you like best about winter?',
      ['Snow', 'Holidays', 'Warm drinks', 'Cozy days']
    ],
    [
      'Which clothing is best for rain?',
      ['Raincoat', 'Swimsuit', 'Sandals', 'Sun hat']
    ],
    [
      'Which clothing is best for snow?',
      ['Coat', 'Shorts', 'Flip-flops', 'Tank top']
    ],
    [
      'What can you build with snow?',
      ['Snowman', 'Sandcastle', 'Treehouse', 'Boat']
    ],
    [
      'What can you do with fallen leaves?',
      ['Make a pile', 'Build a snowman', 'Swim', 'Plant indoors']
    ],
    [
      'Which season has the longest daylight?',
      ['Summer', 'Winter', 'Fall', 'Spring']
    ],
    ['What might you plant in a garden?', ['Seeds', 'Rocks', 'Toys', 'Shoes']],
    [
      'How do you like to celebrate a birthday?',
      ['Cake', 'Games', 'Songs', 'Family time']
    ],
    [
      'What makes a celebration special?',
      ['People', 'Traditions', 'Food', 'All of these']
    ],
    [
      'Which decoration do you enjoy making?',
      ['Cards', 'Paper chains', 'Pictures', 'Wreaths']
    ],
    [
      'What is a good gift you can give without buying it?',
      ['Kind note', 'Help', 'A drawing', 'All of these']
    ],
    [
      'Which outdoor fall activity sounds best?',
      ['Nature walk', 'Leaf art', 'Apple picking', 'Pumpkin patch']
    ],
    [
      'Which winter activity sounds best?',
      ['Sledding', 'Building snow', 'Reading inside', 'Warm cocoa']
    ],
    [
      'Which spring activity sounds best?',
      ['Gardening', 'Puddle jumping', 'Nature walk', 'Flying a kite']
    ],
    [
      'Which summer activity sounds best?',
      ['Swimming', 'Picnic', 'Bike ride', 'Outdoor games']
    ],
    [
      'What tradition would you like to start?',
      ['Special meal', 'Game night', 'Kindness project', 'Story time']
    ],
    [
      'What is worth celebrating at school?',
      ['Learning', 'Kindness', 'Effort', 'All of these']
    ]
  ]
} as const satisfies Record<string, readonly QuestionBankEntry[]>;

export const DEFAULT_STUDENTS = {
  girls: ['Emma', 'Olivia', 'Sophia', 'Ava'],
  boys: ['Liam', 'Noah', 'Oliver', 'Elijah']
} as const;
