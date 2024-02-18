import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseConfig";

class InvestmentPool {
    constructor(poolId, creatorId, poolType, totalAmount = 0, interestRate, paybackTime, contributors = [], loanRequests = []) {
        this.poolId = poolId;
        this.creatorId = creatorId;
        this.poolType = poolType;
        this.totalAmount = totalAmount;
        this.interestRate = interestRate;
        this.paybackTime = paybackTime;
        this.contributors = contributors; // Array of { userId, amountContributed }
        this.loanRequests = loanRequests; // Array of { requestId, userId, amountRequested, status, approvals }
    }

    toFirestore() {
        return {
            poolId: this.poolId,
            creatorId: this.creatorId,
            poolType: this.poolType,
            totalAmount: this.totalAmount,
            interestRate: this.interestRate,
            paybackTime: this.paybackTime,
            contributors: this.contributors,
            loanRequests: this.loanRequests
        };
    }

    async saveToFirestore() {
        const poolRef = doc(FIREBASE_DB, "investmentPools", this.poolId);
        await setDoc(poolRef, this.toFirestore());
        console.log("InvestmentPool saved to Firestore.");
    }

    async addContributor(userId, amount) {
        const contributorIndex = this.contributors.findIndex(contrib => contrib.userId === userId);
        if (contributorIndex !== -1) {
            this.contributors[contributorIndex].amountContributed += amount;
        } else {
            this.contributors.push({ userId, amountContributed: amount });
        }
        this.totalAmount += amount;

        await this.saveToFirestore();
    }

    async withdrawContribution(userId, amount) {
        const contributorIndex = this.contributors.findIndex(contrib => contrib.userId === userId);
        if (contributorIndex === -1 || this.contributors[contributorIndex].amountContributed < amount) {
            throw new Error("Insufficient contribution amount or contributor not found.");
        }
        this.contributors[contributorIndex].amountContributed -= amount;
        this.totalAmount -= amount;

        await this.saveToFirestore();
    }

    generateRequestId() {
        return `req-${Math.random().toString(36).substr(2, 9)}`;
    }

    requestLoan(userId, amountRequested) {
        const requestId = this.generateRequestId();
        const loanRequest = {
            requestId,
            userId,
            amountRequested,
            status: 'Pending',
            approvals: []
        };
        this.loanRequests.push(loanRequest);

        this.saveToFirestore();
        return requestId;
    }

    approveLoanRequest(requestId, approverUserId) {
        const requestIndex = this.loanRequests.findIndex(req => req.requestId === requestId);
        if (requestIndex === -1) throw new Error("Loan request not found.");
        const request = this.loanRequests[requestIndex];

        if (request.status !== 'Pending') throw new Error("Loan request is not pending.");
        if (request.approvals.includes(approverUserId)) throw new Error("Loan request already approved by this user.");

        request.approvals.push(approverUserId);
        const requiredApprovals = Math.ceil(this.contributors.length / 2);

        if (request.approvals.length >= requiredApprovals) {
            request.status = 'Approved';
            this.totalAmount -= request.amountRequested; // Adjust the pool total amount based on the approved loan
        }

        this.saveToFirestore();
    }
}

export default InvestmentPool;
