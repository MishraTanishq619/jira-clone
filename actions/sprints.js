"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createSprint(projectId, data) {
	const { userId, orgId } = auth();

	if (!userId || !orgId) {
		throw new Error("Unauthorized");
	}

	const project = await db.project.findUnique({
		where: {
			id: projectId,
		},
	});

	if (!project || project.organizationId !== orgId) {
		throw new Error("Project not found");
	}

	const sprint = await db.sprint.create({
		data: {
			name: data.name,
			startDate: data.startDate,
			endDate: data.endDate,
			status: "PLANNED",
			projectId: projectId,
		},
	});

	return sprint;
}

export async function updateSprintStatus(sprintId, newStatus) {
	const { userId, orgId, orgRole } = auth();
	if (!userId || !orgId) {
		throw new Error("Unauthorized");
	}

	if (orgRole !== "org:admin") {
		throw new Error("Unauthorized");
	}

	try {
		const sprint = await db.sprint.findUnique({
			where: {
				id: sprintId,
			},
			include: {
				project: true,
			},
		});
		if (!sprint || sprint.project.organizationId !== orgId) {
			throw new Error("Sprint not found");
		}

		const now = new Date();
		const startDate = new Date(sprint.startDate);
		const endDate = new Date(sprint.endDate);

		if (newStatus === "ACTIVE" && (now < startDate || now > endDate)) {
			throw new Error("Cannot start sprint outside the range.");
		}

		if (newStatus === "COMPLETED" && sprint.status != "ACTIVE") {
			throw new Error("Cannot end sprint that is not active.");
		}

		const updatedSprint = await db.sprint.update({
			where: {
				id: sprintId,
			},
			data: {
				status: newStatus,
			},
		});

		return { success: true, sprint: updatedSprint };
	} catch (error) {
		throw new Error(error.message);
	}
}
