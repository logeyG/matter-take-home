import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import { models } from "./db";
import TicketService from "./services/ticket-service"

const PORT = 4001;
const ticketService = new TicketService();

const typeDefs = gql`
  type Ticket {
    id: ID!
    title: String!
    isCompleted: Boolean!
    children: [Ticket]!
  }

  type Query {
    # return a list of all root level (parentless) tickets.
    tickets: [Ticket]!

    # return the ticket with the given id
    ticket(id: ID!): Ticket!
  }

  type Mutation {
    # create a ticket with the given params
    createTicket(title: String!, isCompleted: Boolean): Ticket!

    # update the title of the ticket with the given id
    updateTicket(id: ID!, title: String!): Ticket!

    # update ticket.isCompleted as given
    toggleTicket(id: ID!, isCompleted: Boolean!): Ticket!

    # delete this ticket
    removeTicket(id: ID!): Boolean!

    # every children in childrenIds gets their parent set as parentId
    addChildrenToTicket(parentId: ID!, childrenIds: [ID!]!): Ticket!

    # the ticket with id: childId gets the ticket with id: parentId as its new parent
    setParentOfTicket(parentId: ID!, childId: ID!): Ticket!

    # the ticket with the given id becomes a root level ticket
    removeParentFromTicket(id: ID!): Ticket!
  }
`;

const resolvers = {
  Query: {
    /**
     * We have implemented this first query for you to set up an initial pattern.
     */
    tickets: async (root, args, context) => {
      return models.Ticket.findAll({
        where: {
          parentId: null
        }
      });
    },
    ticket: async (root, args, context) => {
      return models.Ticket.findByPk(args.id);
    }
  },
  Ticket: {
    children: async (root, args, context) => {
      return models.Ticket.findAll({
        where: {
          parentId: root.id
        }
      });
    }
  },
  Mutation: {
    createTicket: async (root, args, context) => {
      return models.Ticket.create({
        title: args.title,
        isCompleted: args.isCompleted ? true : false
      });
    },
    updateTicket: async (root, args, context) => {
      const ticket = await models.Ticket.findByPk(args.id);
      ticket.title = args.title;
      await ticket.save();

      return ticket;
    },
    toggleTicket: async (root, args, context) => {
      const ticket = await models.Ticket.findByPk(args.id);
      ticket.isCompleted = args.isCompleted;
      await ticket.save();

      return ticket;
    },
    removeTicket: async (root, args, context) => {
      const children = await models.Ticket.findAll({
        where: {
          parentId: args.id
        }
      });

      ticketService.validateCanDeleteTicket(args.id, children);

      return models.Ticket.destroy({
        where: {
          id: args.id
        }
      });
    },
    addChildrenToTicket: async (root, args, context) => {
      await models.Ticket.update({ parentId: args.parentId }, {
        where: {
          id: args.childrenIds
        }
      });

      return models.Ticket.findByPk(args.parentId);
    },
    setParentOfTicket: async (root, args, context) => {
      const children = await models.Ticket.findAll({
        where: {
          parentId: args.childId
        }
      });

      // for brevity, this will only work for one level down
      ticketService.validateCanSetParent(args.childId, args.parentId, children);
  
      await models.Ticket.update({ parentId: args.parentId }, {
        where: {
          id: args.childId
        }
      });

      return models.Ticket.findByPk(args.parentId);
    },
    removeParentFromTicket: async (root, args, context) => {  
      await models.Ticket.update({ parentId: null }, {
        where: {
          id: args.id
        }
      });

      return models.Ticket.findByPk(args.id);
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const app = express();
server.applyMiddleware({ app });

app.listen({ port: PORT }, () => {
  console.log(`Server ready at: http://localhost:${PORT}${server.graphqlPath}`);
});
