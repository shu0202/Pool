import { doc, setDoc, getDoc, updateDoc, addDoc, collection } from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseConfig";

class FriendsPool {
  constructor(
    poolName,
    creatorId,
    totalAmount = 0,
    paybackTime,
    contributors = [],
    loanRequests = []
  ) {
    this.poolName = poolName;
    this.creatorId = creatorId;
    this.totalAmount = totalAmount;
    this.paybackTime = paybackTime;
    this.contributors = contributors; // Array of { userId, amountContributed }
    this.loanRequests = loanRequests; // Array of { requestId, userId, amountRequested, status, approvals }
  }

  toFirestore() {
    return {
      poolName: this.poolName,
      creatorId: this.creatorId,
      totalAmount: this.totalAmount,
      paybackTime: this.paybackTime,
      contributors: this.contributors,
      loanRequests: this.loanRequests,
    };
  }

  async saveToFirestore() {
    const docRef = await addDoc(
      collection(FIREBASE_DB, "friendsPools"),
      this.toFirestore()
    );

    this.poolId = docRef.id; // Save the auto-generated ID to the instance
    const poolRef = doc(FIREBASE_DB, "friendsPools", this.poolId);
    await setDoc(poolRef, this.toFirestore());
    console.log("FriendsPool saved to Firestore.");
  }

  async addContributor(userId, amount) {
    const contributorIndex = this.contributors.findIndex(
      (contrib) => contrib.userId === userId
    );
    if (contributorIndex !== -1) {
      this.contributors[contributorIndex].amountContributed += amount;
    } else {
      this.contributors.push({ userId, amountContributed: amount });
    }
    this.totalAmount += amount;

    await this.saveToFirestore();
  }

  async withdrawContribution(userId, amount) {
    const contributorIndex = this.contributors.findIndex(
      (contrib) => contrib.userId === userId
    );
    if (
      contributorIndex === -1 ||
      this.contributors[contributorIndex].amountContributed < amount
    ) {
      throw new Error(
        "Insufficient contribution amount or contributor not found."
      );
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
      status: "Pending",
      approvals: {},
    };

    // Initialize approval flags for all contributors except the requester
    this.contributors.forEach(({ userId: contributorId }) => {
      if (contributorId !== userId) {
        loanRequest.approvals[contributorId] = false;
      }
    });

    this.loanRequests.push(loanRequest);

    this.saveToFirestore();
    return requestId;
  }

  approveLoanRequest(requestId, contributorUserId) {
    const requestIndex = this.loanRequests.findIndex(
      (req) => req.requestId === requestId
    );
    if (requestIndex === -1) throw new Error("Loan request not found.");
    const request = this.loanRequests[requestIndex];

    if (request.status !== "Pending")
      throw new Error("Loan request is not pending.");
    if (request.approvals[contributorUserId])
      throw new Error("Loan request already approved by this user.");

    request.approvals[contributorUserId] = true;

    // Check if all necessary approvals have been received
    const isApproved = Object.values(request.approvals).every(
      (approved) => approved
    );
    if (isApproved) {
      request.status = "Approved";
      // Handle funds transfer logic here if necessary
      this.totalAmount -= request.amountRequested; // Adjust the pool total amount based on the approved loan
    }

    this.saveToFirestore();
  }
}

export default FriendsPool;
