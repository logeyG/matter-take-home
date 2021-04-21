class TicketService {
    validateCanDeleteTicket(parentId, children) {
        if (children && children.length > 0) {
            throw Error(`Ticket id=${parentId} has child tickets [${children.map(c => c.id).join(', ')}]. Parent tickets cannot be deleted if they have children.`);
        }

        return true;
    }
    
    validateCanSetParent(childId, parentId, children) {
        if(children.map(t => t.id).some(id => id == parentId)) {
            throw Error(`Cannot set parent as this would create a circular reference, given child id=${childId} is a parent of ticket id=${parentId}`);
          }

          return true;
    }
}

export default TicketService;