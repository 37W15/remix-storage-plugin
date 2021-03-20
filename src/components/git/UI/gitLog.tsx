import { ReadCommitResult } from "isomorphic-git";
import React, { createRef } from "react";
import { useBehaviorSubject } from "use-subscribable";
import { gitservice, Utils } from "../../../App";
import { default as dateFormat } from "dateformat";
import ConfirmDelete from "../../ConfirmDelete";
interface gitLogProps {}

export const GitLog: React.FC<gitLogProps> = ({}) => {
  const commits = useBehaviorSubject(gitservice.commits);
  let ModalRef = createRef<ConfirmDelete>();
  let show = false;

  gitservice.commits
    .subscribe((x) => {
      //Utils.log(commits);
      if (commits) {
        show = commits.length > 0;
      }
    })
    .unsubscribe();

  const getDate = (commit: ReadCommitResult) => {
    let date = dateFormat(
      commit.commit.committer.timestamp * 1000,
      "dddd, mmmm dS, yyyy, h:MM:ss TT"
    );
    return date;
  };

  const checkout = async (oid:string) => {
    try {
      await ModalRef.current?.show();
      gitservice.checkout({ref:oid})
      //Utils.log("yes");
    } catch (e) {
      //Utils.log("no");
    }
  };

  return (
    <>
      <hr />
      <div className={show ? "" : "d-none"}>
        <h4>Commits</h4>
        <ConfirmDelete title={"Checking out"} text={<div>Checking out a commit will delete the files in Remix.<br></br><strong>Check if you have uncommited work.</strong><br></br>Continue?</div>} ref={ModalRef}></ConfirmDelete>
        <div className="container-fluid">
          {commits?.map((commit) => {
            return (
              <div key={commit.oid} className="row p-1">
                <div className="col-2">{commit.commit.message}</div>
                <div className="col">{getDate(commit)}</div>
                <div className="col">{commit.oid}</div>
                <div
                  onClick={async () => await checkout(commit.oid)}
                  className="btn btn-primary btn-sm checkout-btn"
                >
                  git checkout
                </div>
              </div>
            );
          })}

          <div
            onClick={async () => await checkout("main")}
            className="btn btn-primary btn-sm checkout-btn"
            data-oid="main"
          >
            git checkout main
          </div>
        </div>
      </div>
    </>
  );
};
