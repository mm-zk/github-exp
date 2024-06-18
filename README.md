# Github and web3

The goal of this project, is to add a bunch of web3 features to github.
Including things like:

* Rewards for submitting PRs & fixing issues
* Rewards for code reviews
* ACL / Permission control based on the web3 state.



## Technical details

Project consists of 3 parts:
* frontend
* backend
* contracts


### Frontend
This will host the pages that users will be using (doing things like connecting their wallets etc).
We should aim at these pages to be stateless (so that they query github & web3 directly).

### Backend
This part is typescript to manage 'oracles' - these would be permisioned, and responsible for signing the 'state' of the
github repos/issues and commiting them to the chain.


### Contracts
This directory contains all the contract information.


## High level view


### Github Oracle

We should have a single permissioned 'oracle', that would be responsible to keeping the 'state' of the github within web3.

As we cannot simply 'store' everything, we'll have to design it in such a way, that it persists only the hashes of
the 'important' things (like given issues / PRs etc).

The interesting thing we could do here, is actually integrate the paymaster **within** the oracle - this way,
if someone is interested in updating a state of a given issue / PR, they can call the special function, and deposit a little amount of money.
Then the 'permissioned' oracle owner, will be able to use Oracle's funds as paymaster to cover the fee of updating the value.
(the alternative would be for the requestor to send ETH directly to permissioned oracle owner - but there might be multiple of them - and this way it is more clear that these tokens will be used for gas).


### NFT Dev
The idea is to have the NFTs that will be automatically minted for users that 'contribute' to a given repo.
This is managed by the `backend/dev_nft_manager`.

For people to 'claim' - in order to avoid having to do some 'github sign-in' - they can simply post their public address, in a comment in a given (fixed) PR. Then the tool is periodially reading it, and minting the NFTs.


### Whitelist manager
To restrict the NFT claiming etc, only to people who actually contributed, there is a whitelist manager in `backend/tools/update_whitelist.ts` - that looks at all the contributors and creates a static whitelist.
This should be later integrated with the NFT minter above.


### Frontend
Currently the frontend code  (mostly `frontend/components/Github.vue`) is focusing on fetching the list of github issues from github directly.
The next step would be to fetch the bounties from the contracts, and then do things like allow adding the bounties etc.




## Instalation

* Start era-test-node 
* in contracts - `npm run deploy` - will deploy the contracts, and put their addresses into ./.generated.env
* then in backend - `npm run start` - this will mint NFTs and create the mapping from github names to addresses.
* // TODO: then in backend, start the oracle
* // TODO: then in backend, start the thing update github comments when bounties are created
* in frontend - create .env file with the target repo (see .example.env)
* then start frontend - from frontend dir - `npm run dev`



## TODO:


* [] Add whitelist to backend/nft_manager
* [] Figure out how rewarding for PR creation should look like
* [] setup the github bot (probably as some 'backend cron job') - that would query web3, and then post updates on github (mentioning things like 'this PR has a bounty now')
* [] figure out the Permission control levels - and how the frontend should look like  -- the basic one would be -- 'if these users LGTMed' - you can merge.


