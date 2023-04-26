# Drømtorp Aktiviteter Backend
This is the backend code for a school project I have.

## What is this project?
It will be a site for viewing and joining events hosted by the school. This backend code handles the saving and reading of the database with all the info needed.

## Weird commit history?
Idk, maybe? ＞﹏＜ This is a school project, and my teacher wants me to commit and push my work after every class so he can see it.

## Non-english commit messages
My bad, I might sometimes forget and write them in norwegian. ¯\\(°_o)/¯ Blame my teacher for wanting them in norwegian on previous work. This is english specifically because it's a public repository.

If I do accidentally write a commit message in norwegian, I will try and at least comment on the commit what it is in english! (～﹃～)~zZ


## Why a public repository for a school project?
Because I felt like it for the most part. Use my shitty code if you want. Don't forget about the license. 

## License?
Sure buddy, look right [here](./LICENSE) ☜(ﾟヮﾟ☜)

It's **GPL-2.0** <sub>wow, how could you, why not MIT!1!!</sub> because I have some certain standards and self respect (not that MIT or using it is bad in any way!!!). Would be cool if there was a license like it but without the "state changes" part as I don't care about that, but oh well.

Not like this code is any great in the first place where it will be useful for someone else in a large manner.

## Git Ignore
Only two files that actually matter are `tokens.json` and `db-login.json`. Sensitive stuff and all that so I can't commit them to the web.

### tokens.json
```
{
    "JWT_Secret": "Your_Secret_Here!"
}
```

### db-login.json
```
{
    "Database_Host": "your.domain",
    "Database_User": "your_user",
    "Database_Password": "YourPassword123",
    "Database_Name": "Database_Name_Here"
}
```

That should be it!

## Database
MySQL baby!!!! (╯°□°）╯︵ ┻━┻

Yeah no, one would obviously need the database to use any of this. ┳━┳ ノ( ゜-゜ノ)

[Here is the database SQL.](./database.sql) Just import it or whatever. Just run it and it should make the database.

## Frontend code?
You can find the [frontend right here](https://github.com/TrippelZ/dromtorp-aktiviteter-frontend)! ☜(ﾟヮﾟ☜)

Same license! Same code quality!