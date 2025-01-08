import { getProject } from "@/actions/projects";
import { notFound } from "next/navigation";
import React from "react";
import SprintCreationBoard from "../_components/SprintCreationBoard";

const page = async ({ params }) => {
	const { projectId } = params;
	const project = await getProject(projectId);
	if (!project) {
		notFound();
	}
	return (
		<div className="container mx-auto">
			<SprintCreationBoard
				projectTitle={project.name}
				projectId={projectId}
				projectKey={project.key}
				sprintKey={project.sprints.length + 1}
			/>

			{/* Sprint Board */}
			{project.sprints.length > 0 ? (
				<></>
			) : (
				<>Create a Sprint from button above.</>
			)}
		</div>
	);
};

export default page;
