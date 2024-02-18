import { doc, setDoc } from "firebase/firestore"
import { FIREBASE_DB } from "../..firebaseConfig";

class InvestmentPool {
    constructor(investPoolId, creatorId, poolType, totalAmount = 0, interestRate, paybackTime, contributorIds = [], loanRequests = []) {
        this.investPoolId = investPoolId; // Unique identifier for the pool
        this.creatorId = creatorId; // UserID of the pool creator
        this.totalAmount = totalAmount; // Total amount currently in the pool
        this.interestRate = interestRate; // Interest rate for the pool (applicable for Interest Pools only)
        this.paybackTime = paybackTime; // Expected payback time in days
        this.contributorIds = contributorIds; // Array of objects { userId, amountContributed }
        this.loanRequests = loanRequests || [];
    }
    // Method to add a contributor to the pool
    addContributor(userId, amount) {
        // Check if the user has already contributed to the pool
        const existingContributor = this.contributorIds.find(contributor => contributor.userId === userId);
        if (existingContributor) {
            existingContributor.amountContributed += amount;
        } else {
            this.contributorIds.push({ userId, amountContributed: amount });
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
        const existingContributor = this.contributorIds.find(contributor => contributor.userId === userId);
        if (existingContributor) {
            // Update existing contribution
            existingContributor.amountContributed += amount;
        } else {
            // Add new contributor
            this.contributorIds.push({ userId, amountContributed: amount });
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
            approvals: [] // Track which contributorIds have approved this request
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
        const requiredApprovals = Math.ceil(this.contributorIds.length / 2); // For example, majority approval

        if (approvalCount >= requiredApprovals) {
            request.status = 'Approved';
            // Logic to transfer money to the requester...
            this.totalAmount -= request.amountRequested
        }
    }

    calculateLoanReturnAmount(amount) {
        const timeInYears = this.paybackTime / 365;
        const amountToBeRepaid = amount * (1 + this.interestRate * timeInYears);
        return amountToBeRepaid;
    }
    // Method to calculate and distribute returns to contributorIds (for Interest Pools)
    distributeReturns() {
        this.contributorIds.forEach(contributor => {
            const returnAmount = contributor.amountContributed * (1 + this.interestRate);
            // This function assumes there's a mechanism to update the user's wallet balance
            // updateUserWallet(contributor.userId, returnAmount);
        });
    }
    // Method to allow contributorIds to withdraw their contributions before the pool reaches its payback time, assuming the pool rules allow for such withdrawals.
    withdrawContribution(userId, amount) {
        // Find the contributor in the pool
        const contributorIndex = this.contributorIds.findIndex(contributor => contributor.userId === userId);
        if (contributorIndex === -1) {
            throw new Error("Contributor not found.");
        }
        const contributor = this.contributorIds[contributorIndex];

        // Check if the contributor has enough balance to withdraw
        if (contributor.amountContributed < amount) {
            throw new Error("Insufficient contribution balance for withdrawal.");
        }

        // Update the contributor's contribution and the pool's total amount
        contributor.amountContributed -= amount;
        this.totalAmount -= amount;

        console.log(`Contributor ${userId} withdrew ${amount} from the pool.`);

    }

    // Convert pool object to a database-friendly format
    toFirestore() {
        return {
            investPoolId: this.investPoolId,
            creatorId: this.creatorId,
            poolType: this.poolType,
            totalAmount: this.totalAmount,
            interestRate: this.interestRate,
            paybackTime: this.paybackTime,
            contributorIds: this.contributorIds.map(contributor => ({
                userId: contributor.userId,
                amountContributed: contributor.amountContributed
            })),
            loanRequests: this.loanRequests.map(request => ({
                requestId: request.requestId,
                userId: request.userId,
                amountRequested: request.amountRequested,
                status: request.status,
                approvals: request.approvals
            }))
        };
    }
    // Function to save an InvestmentPool to Firestore
    async saveToFirestore() {
        const poolData = this.toFirestore(); // Use this instance's data
        try {
            await setDoc(doc(FIREBASE_DB, "investmentPools", this.investPoolId), poolData);
            console.log("InvestmentPool successfully saved to Firestore!");
        } catch (error) {
            console.error("Error saving InvestmentPool to Firestore: ", error);
        }
    }
}