Trying to create a bounty but I keep getting this error: 

2024-06-19 19:16:17 zksync-1  | 23:16:17  INFO Call: FAILED: Error function_selector = 0x, data = 0x
2024-06-19 19:16:17 zksync-1  | 23:16:17  INFO === Console Logs: 
2024-06-19 19:16:17 zksync-1  | 23:16:17  INFO === Call traces:
2024-06-19 19:16:17 zksync-1  | 23:16:17  INFO execution reverted


GitHub usernames are case-insensitive. You can find "itsacoyote" with 
the string "Itsacoyote". This obviously will not make the same keccak. 
Need to lowercase.


Now I get the following error for trying to create a bounty:

2024-06-19 20:57:11 zksync-1  | 00:57:11  INFO Call: FAILED: ERC20: insufficient allowance
2024-06-19 20:57:11 zksync-1  | 00:57:11  INFO === Console Logs: 
2024-06-19 20:57:11 zksync-1  | 00:57:11  INFO === Call traces:
2024-06-19 20:57:11 zksync-1  | 00:57:11  INFO execution reverted: ERC20: insufficient allowance