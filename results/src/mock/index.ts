export const categories = [
    {
        name: 'Category A',
        currentVotes: 320000,
        currentPercentage: 25,
        increase: 3,
        candidates: [
            {
                name: 'Jonathan Good',
                party: 'Party D',
                picture: 'https://picsum.photos/300/300?image=39',
                currentVotes: 3400,
                increase: 4.5
            },
            {
                name: 'Kate Middleton',
                party: 'Party J',
                picture: 'https://picsum.photos/300/300?image=25',
                currentVotes: 2304,
                increase: -2
            },
            {
                name: 'Quinter Rich',
                party: 'Party X',
                picture: 'https://picsum.photos/300/300?image=12',
                currentVotes: 500,
                increase: 10
            }
        ]
    },
    {
        name: 'Category F',
        currentVotes: 250000,
        currentPercentage: 35,
        increase: -1,
        candidates: [
            {
                name: 'Elisha Hunterman',
                party: 'Party J',
                picture: 'https://picsum.photos/300/300?image=45',
                currentVotes: 900,
                increase: 2
            },
            {
                name: 'Lois Strongman',
                party: 'Party D',
                picture: 'https://picsum.photos/300/300?image=54',
                currentVotes: 1201,
                increase: -2
            },
            {
                name: 'Racheal Daiety',
                party: 'Party X',
                picture: 'https://picsum.photos/300/300?image=12',
                currentVotes: 800,
                increase: -7
            }
        ]
    },
    {
        name: 'Category Q',
        currentVotes: 235000,
        currentPercentage: 40,
        increase: 0.3,
        candidates: [
            {
                name: 'Wendy Chi',
                party: 'Party X',
                picture: 'https://picsum.photos/300/300?image=35',
                currentVotes: 1301,
                increase: 10
            },
            {
                name: 'Reuben Josh',
                party: 'Party J',
                picture: 'https://picsum.photos/300/300?image=541',
                currentVotes: 2850,
                increase: 13
            },
            {
                name: 'Ilama McMP',
                party: 'Party D',
                picture: 'https://picsum.photos/300/300?image=124',
                currentVotes: 3400,
                increase: -2
            }
        ]
    }
];

export const parties = [
    {
        name: 'Party J',
        currentVotes: 700000,
        increase: 10,
        currentPercentage: 30,
        candidates: [
            {
                name: 'Kate Middleton',
                category: 'Category A'
            },
            {
                name: 'Elisha Hunterman',
                category: 'Category F'
            },
            {
                name: 'Reuben Josh',
                category: 'Category Q'
            }
        ]
    },
    {
        name: 'Party X',
        currentVotes: 800234,
        increase: -3,
        currentPercentage: 50,
        candidates: [
            {
                name: 'Ilama McMP',
                category: 'Category Q'
            },
            {
                name: 'Racheal Daiety',
                category: 'Category F'
            },
            {
                name: 'Quinter Rich',
                category: 'Category A'
            }
        ]
    },
    {
        name: 'Party D',
        currentVotes: 323193,
        increase: 17,
        currentPercentage: 23,
        candidates: [
            {
                name: 'Jonathan Good',
                category: 'Category A'
            },
            {
                name: 'Lois Strongman',
                category: 'Category F'
            },
            {
                name: 'Reuben Josh',
                category: 'Category Q'
            }
        ]
    }
]