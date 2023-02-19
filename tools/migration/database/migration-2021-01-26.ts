import { ProjectModel } from "@/server/schema/entities/ProjectTC";

export const version = 1;

export default async function() {
    const projects = await ProjectModel.find({}).lean<any>();
    const updates = projects.map((project) => {
        const filter = {_id: project._id};
        if (!project.paycheck?.type && (project.shiftCost || project.overtimeCost)) {
            return {
                updateOne: {
                    filter,
                    update: {
                        paycheck: {
                            type: project.shiftCost > 0 ? 'shift' : 'month',
                            amount: project.shiftCost || 0,
                            overtime: project.overtimeCost || 0
                        }
                    }
                }
            };
        }
        if (!project.paycheck) {
            return {
                updateOne: {
                    filter,
                    update: {paycheck: {}}
                }
            }
        }
        return;
    }).filter(Boolean);
    return ProjectModel.bulkWrite(updates);
}
