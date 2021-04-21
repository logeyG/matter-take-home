import TicketService from "../services/ticket-service"

test('throws error when a parent ticket has children', () => {
    const ticketService = new TicketService();

    expect(() => {
        ticketService.validateCanDeleteTicket(1, [{ id: 1 }, { id: 2 }]);
    }).toThrow();
});

test('passes validation when a parent ticket has no children', () => {
    const ticketService = new TicketService();
    expect(ticketService.validateCanDeleteTicket(1, [])).toBeTruthy();
});

test('throws error if setting parent would create circular reference', () => {
    const ticketService = new TicketService();

    const children = [
        {id: 2, parentId: 1, title: "Ticket 2"}
    ];

    expect(() => {
        ticketService.validateCanSetParent(1, 2, children);
    }).toThrow();
});

test('passes validation when no circular reference would be created', () => {
    const ticketService = new TicketService();

    const children = [
        {id: 3, parentId: 1, title: "Ticket 3"}
    ];

    expect(ticketService.validateCanSetParent(2, 1, children)).toBeTruthy();
});