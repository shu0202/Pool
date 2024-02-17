class InvestmentPool {
    constructor(poolId, creatorId, poolType, totalAmount = 0, paybackTime, contributors = []) {
        this.poolId = poolId; // Unique identifier for the pool
        this.creatorId = creatorId; // UserID of the pool creator
        this.totalAmount = totalAmount; // Total amount currently in the pool
        this.paybackTime = paybackTime; // Expected payback time
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
            paybackTime: this.paybackTime,
            contributors: this.contributors
        };
    }
}