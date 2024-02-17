class InvestmentPool {
    constructor(poolId, creatorId, poolType, totalAmount = 0, interestRate, paybackTime, contributors = []) {
        this.poolId = poolId; // Unique identifier for the pool
        this.creatorId = creatorId; // UserID of the pool creator
        this.totalAmount = totalAmount; // Total amount currently in the pool
        this.interestRate = interestRate; // Interest rate for the pool (applicable for Interest Pools only)
        this.paybackTime = paybackTime; // Expected payback time in days
        this.contributors = contributors; // Array of objects { userId, amountContributed }
    }
    // Method to add a contributor to the pool
    addContributor(userId, amount) {
        // Check if the user has already contributed to the pool
        const existingContributor = this.contributors.find(contributor => contributor.userId === userId);
        if (existingContributor) {
            existingContributor.amountContributed += amount;
        } else {
            this.contributors.push({ userId, amountContributed: amount });
        }
        this.totalAmount += amount;
    }

    // Method to set the interest rate for the pool
    // Ensure this method is callable only by the pool creator or system admin
    setInterestRate(newRate) {
        this.interestRate = newRate;
    }

    setPaybackTime(newPaybackTime) {
        this.paybackTime = newPaybackTime;
    }

    // Method for a user to contribute to the pool
    contribute(userId, amount) {
        // Check if the user is already a contributor
        const existingContributor = this.contributors.find(contributor => contributor.userId === userId);
        if (existingContributor) {
            // Update existing contribution
            existingContributor.amountContributed += amount;
        } else {
            // Add new contributor
            this.contributors.push({ userId, amountContributed: amount });
        }
        // Update the total amount of the pool
        this.totalAmount += amount;
        // Optionally, update the pool details in the database
    }
    requestLoan(userId, amountRequested) {
        const request = {
            requestId: this.generateRequestId(),
            userId: userId,
            amountRequested: amountRequested,
            status: 'Pending', // Initial status of the loan request
            approvals: [] // Track which contributors have approved this request
        };
        this.loanRequests.push(request);
        return request;
    }
    approveLoanRequest(requestId, approverUserId) {
        const request = this.loanRequests.find(req => req.requestId === requestId);
        if (!request) {
            throw new Error('Loan request not found.');
        }
        if (request.status !== 'Pending') {
            throw new Error('Loan request is not in a pending state.');
        }
        if (request.approvals.includes(approverUserId)) {
            throw new Error('This user has already approved the request.');
        }

        // Add the approver's userId to the list of approvals
        request.approvals.push(approverUserId);

        // Check if the request has enough approvals
        const approvalCount = request.approvals.length;
        const requiredApprovals = Math.ceil(this.contributors.length / 2); // For example, majority approval

        if (approvalCount >= requiredApprovals) {
            request.status = 'Approved';
            // Logic to transfer money to the requester...
        }
    }

    calculateLoanReturnAmount(amount) {
        const timeInYears = this.paybackTime / 365;
        const amountToBeRepaid = amount * (1 + this.interestRate * timeInYears);
        return amountToBeRepaid;
    }
    // Method to calculate and distribute returns to contributors (for Interest Pools)
    distributeReturns() {
        this.contributors.forEach(contributor => {
            const returnAmount = contributor.amountContributed * (1 + this.interestRate);
            // This function assumes there's a mechanism to update the user's wallet balance
            // updateUserWallet(contributor.userId, returnAmount);
        });
    }
    // Convert pool object to a database-friendly format
    toFirestore() {
        return {
            poolId: this.poolId,
            creatorId: this.creatorId,
            totalAmount: this.totalAmount,
            interestRate: this.interestRate,
            paybackTime: this.paybackTime,
            contributors: this.contributors
        };
    }
}