import { useContext, useMemo, useState } from "react";
import { useProjectsData } from "src/storages/projectsData";
import bem from "src/utils/bem";
import "../styles/project-page.scss";
import { ImageModalContext } from "./ImageModal";
import ProjectsTable from "./ProjectsTable";
import Ticker from "./Ticker";

const cn = bem("project-page");

export default function Project() {
  const [currentId, setCurrentId] = useState<null | number>(null);
  const [projects] = useProjectsData();
  const current = useMemo(
    () =>
      projects?.length
        ? currentId
          ? projects.find((p) => p.id === +currentId) ||
            projects[projects.length - 1]
          : projects.find((p) => p.is_now) || projects[projects.length - 1]
        : null,
    [currentId, projects]
  );
  const pastProjects = useMemo(
    () => (current ? projects?.filter((p) => +p.id !== +current.id) : projects),
    [current, projects]
  );
  const { openImageModal } = useContext(ImageModalContext);

  return (
    <div className={cn()}>
      {!!current && (
        <img
          alt="Анонс проекта"
          className={cn("main-image")}
          src={current.main_picture}
        />
      )}
      {!!current && (
        <div className={cn("main-descr")}>{current.description}</div>
      )}
      {!!current.other_pictures?.length && (
        <div className={cn("images-layout")}>
          {current.other_pictures.map((p) => (
            <img onClick={() => openImageModal(p)} src={p} />
          ))}
        </div>
      )}
      {!!pastProjects?.length && (
        <>
          {!!current && (
            <Ticker
              text={current.is_now ? "PAST PROJECTS" : "INSIGHT PROJECTS"}
              main={true}
            />
          )}
          <ProjectsTable
            data={pastProjects}
            crossfade={false}
            onNavigate={(id) => {
              setCurrentId(id);
              window.scrollTo(0, 0);
            }}
          />
        </>
      )}
    </div>
  );
}
