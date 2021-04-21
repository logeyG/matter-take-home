# Assumptions and Reflections

This was an enjoyable challenge! I went into the project not knowing anything about GraphQL and now understand why it is becoming so popular.

A few notes on assumptions:


## setParentOfTicket()
For setParentOfTicket(), I am assuming that the ability to create tickets with a circular reference is undesirable. A ciruclar reference would look like the following:

```
{
  "data": {
    "ticket": {
      "id": "1",
      "title": "Ticket A",
      "children": [
        {
          "id": "2",
          "title": "Ticket B",
          "children": [
            {
              "id": "1",
              "title": "Ticket A",
              "children": []
            }
          ]
        }
      ]
    }
  }
}

```
The main reason for this is that once a ticket has a circular reference, it will not be returned with the generic `tickets` query as the `parentId` for every ticket is now not null.

I added validation logic that protects against this at a single parent/child level. However, it is still possible to create a cicular reference like so:

```
{
  "data": {
    "ticket": {
      "id": "3",
      "title": "New Ticket C",
      "children": [
        {
          "id": "2",
          "title": "New Ticket B",
          "children": [
            {
              "id": "1",
              "title": "New Ticket A",
              "children": [
                {
                  "id": "3",
                  "title": "New Ticket C"
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
```

I am confident I could write code that protects against this, but feel it is outside the scope of this inital assignment.


## removeTicket()
For the removeTicket() function, I am assuming that if a parent ticket with children is attempted to be deleted, the server should throw an error. Another option to handle this - and avoid foreign key issues in the database - would be to first delete all children of the parent ticket, and then finally the parent ticket.

## Fetching the children everytime a ticket is fetched
For every ticket that is fetched, a subsequent query will be run to fetch that ticket's children. This ultimately could create a lot of load on the database, and could be improved by either implementing joins in our queries, or by using some kind of cache to avoid hitting the database unless necessary. While this would add a nice performance benefit, it would also increase the code's complexity.

# Reflections on my solution

I have several reflections on my solution I think are important to note. One is my inclusion of the `TicketService` and corresponding tests for this service (`ticket-service.test.js`), which can be run with `npm run test`. Because the two functions covered by this service contain some light business logic, I thought the `TicketService` would show as a good example how I would handle making sure the business logic of the application is well tested. It would be nice to see some integration level tests - for example, a mock client that calls the GQL endpoints and verifies responses, and potentially even verifies database results. As adding integration level tests would require much more complicated test setup (and perhaps a test dabatase), I have considered this outside the scope of this assignment.

Another improvement of the solution would be to increase the seperation of concerns through a database layer. Currently, most all of the logic for this solution exists in `server.js`. For an application that is production ready, having `sever.js` only be concerned with the API, and then calling to a database layer that specifically focuses on database operations could be more readable and testable. This is what I have experience in, but when using GraphQL best practices may be different, but figured I'd still note this here.