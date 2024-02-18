import { doc, setDoc } from "firebase/firestore"
import { FIREBASE_DB } from "../..firebaseConfig";

class FriendlyPool {
    constructor(friendPoolId, creatorId, poolType, totalAmount = 0, paybackTime, contributorIds = [], loanRequests = []) {
        this.friendPoolId = friendPoolId; // Unique identifier for the pool
        this.creatorId = creatorId; // UserID of the pool creator
        this.totalAmount = totalAmount; // Total amount currently in the pool
        this.paybackTime = paybackTime; // Expected payback time
        this.contributorIds = contributorIds; // Array of objects { userId, amountContributed }
        this.loanRequests = loanRequests;
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
    setPaybackTime(newPaybackTime) {
        this.paybackTime = newPaybackTime;
    }
    // Method to calculate and distribute returns to contributorIds (for Interest Pools)
    distributeReturns() {
        this.contributorIds.forEach(contributor => {
            const returnAmount = contributor.amountContributed * (1 + this.interestRate);
            // This function assumes there's a mechanism to update the user's wallet balance
            // updateUserWallet(contributor.userId, returnAmount);
        });
    }
    requestLoan(userId, amountRequested) {
        const request = {
            request: this.generateRequestId(),
            userId: userId,
            amountRequested: amountRequested,
            status: "Pending", // Initial status of the loan request
            approvals: {}, // Object to track approvals from contributorIds
        };
        // Initialize all approvals to false
        this.contributorIds.forEach(contributor => {
            if (contributor.userId !== userId) {
                request.approvals[contributor.userId] = false;
            }
        });
        this.loanRequests.push(request);
        return request;
    }

    // Method for a contributor to approve a loan request
    approveLoanRequest(requestId, contributorUserId) {
        const request = this.loanRequests.find(req => req.requestId === requestId);
        if (!request) {
            throw new Error('Loan request not found.');
        }

        if (request.status !== 'Pending') {
            throw new Error('This request has already been processed.');
        }

        // Record approval
        if (request.approvals.hasOwnProperty(contributorUserId)) {
            request.approvals[contributorUserId] = true;
        }

        // Check if the request meets the approval criteria
        this.checkApprovalCriteria(request);
    }
    // Method to check if a loan request meets the approval criteria
    checkApprovalCriteria(request) {
        const totalcontributorIds = Object.keys(request.approvals).length;
        const approvalsReceived = Object.values(request.approvals).filter(approval => approval).length;

        // Example criterion: More than half of the contributorIds must approve
        if (approvalsReceived > totalcontributorIds / 2) {
            request.status = 'Approved';
            // Logic for transferring the loan amount to the requester could go here
        }
    }

    // Convert pool object to a database-friendly format
    toFirestore() {
        return {
            friendPoolId: this.friendPoolId,
            creatorId: this.creatorId,
            totalAmount: this.totalAmount,
            paybackTime: this.paybackTime,
            contributorIds: this.contributorIds
        };

    }

    // Function to save an FriendsPool to Firestore
    async saveInvestmentPoolToFirestore(pool) {
        const poolData = pool.toFirestore();
        try {
            await setDoc(doc(FIREBASE_DB, "investmentPools", pool.friendPoolId), poolData);
            console.log("InvestmentPool successfully saved to Firestore!");
        } catch (error) {
            console.error("Error saving InvestmentPool to Firestore: ", error);
        }
    }
}