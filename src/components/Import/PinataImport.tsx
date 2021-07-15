import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { createRef, useEffect, useState } from "react";
import { Accordion, Alert, Button, Card } from "react-bootstrap";
import { useBehaviorSubject } from "../usesubscribe/index";
import { client, ipfservice, loaderservice } from "../../App";
import ConfirmDelete from "../ConfirmDelete";

import dateFormat from "dateformat";

interface PinataImportProps {}

export const PinataImport: React.FC<PinataImportProps> = ({}) => {
  const status = useBehaviorSubject(ipfservice.pinataConnectionStatus);
  let [data, setData] = useState<any[]>([]);
  let ModalRef = createRef<ConfirmDelete>();
  let EraseModalRef = createRef<ConfirmDelete>();
  let EraseModalOld = createRef<ConfirmDelete>();
  ipfservice.pinataConnectionStatus.subscribe((x) => {}).unsubscribe();

  useEffect(() => {
    if (status) read();
  }, [status]);

  const getUrlLink = (cid: string | undefined) => {
    if (cid !== "" && cid !== undefined) {
      return (
        <a target="_blank" href={getUrl(cid)} id="CID">
          {getUrl(cid)}
        </a>
      );
    } else {
      return <></>;
    }
  };

  const read = async () => {
    try {
      try {
        let r = await client.call(
          "dGitProvider" as any,
          "pinList",
          ipfservice.pinataConfig.key,
          ipfservice.pinataConfig.secret
        );
        let rows = (r.rows || []).filter((o: any) => {
          return o.metadata.keyvalues;
        });
        for (let row of rows) {
          try {
            row.metadata.keyvalues.commits = JSON.parse(
              row.metadata.keyvalues.commits
            );
          } catch (e) {
            row.metadata.keyvalues.commits = [];
          }
        }
        // find any row that is included in another row with the same tree
        for (let row of rows) {
          if (row.metadata.keyvalues.commits[0]) {
            const tree = row.metadata.keyvalues.commits[0].commit.tree;
            const oid = row.metadata.keyvalues.commits[0].oid;
            const doubles = rows.filter((subrow: any) => {
              if(subrow.metadata.keyvalues.commits){
                return subrow.metadata.keyvalues.commits.find((commit: any) => {
                  return commit.commit.tree === tree && commit.oid === oid && subrow.metadata.keyvalues.ref !== oid
                })
              }else{
                return false
              }
            });
            row.hasChild = doubles.length > 0
            row.doubles = doubles
            console.log("DOUBLES OF,,,", oid, tree, doubles)
          }
        }
        console.log("ROWS", rows);
        setData(rows);
      } catch (err) {
        console.log(err);
      }
      //this.objects = r? JSON.parse(r):[];
      //Utils.log("READ CONFIG",this.objects);
    } catch (e) {}
  };

  const getViewButton = (cid: string | undefined) => {
    if (cid !== "" && cid !== undefined) {
      return (
        <a
          className="btn btn-primary btn-sm mr-2"
          target="_blank"
          href={getUrl(cid)}
          id="CID"
        >
          View files
        </a>
      );
    } else {
      return <></>;
    }
  };

  const getDate = (str: any) => {
    let date = dateFormat(
      str * 1000,
      "dddd, mmmm dS, yyyy, h:MM:ss TT"
    );
    return date;
  };

  const getUrl = (cid: string) => {
    return `${ipfservice.ipfsconfig.ipfsurl}${cid}`;
  };

  const importFromCID = async (cid: string | undefined, name: string = "") => {
    try {
      await ModalRef.current?.show();

      await ipfservice.importFromCID(cid, name, false);
      //Utils.log("yes");
    } catch (e) {
      //Utils.log("no");
    }
  };

  const deleteOldItems = async () => {
    try {
      await EraseModalOld.current?.show();
      try {
        loaderservice.setLoading(true)
        for(let o of data){
          if(o.hasChild){
            console.log("delete ", o)
            let r = await client.call(
              "dGitProvider" as any,
              "unPin",
              ipfservice.pinataConfig.key,
              ipfservice.pinataConfig.secret,
              o.ipfs_pin_hash
            );
          }
        }

        await read();
      } catch (err) {
        console.log(err);
      } finally {
        loaderservice.setLoading(false)
      }

    } catch (e) {

    }
  }

  const deleteItem = async (cid: string) => {
    try {
      await EraseModalRef.current?.show();
      try {
        loaderservice.setLoading(true)
        let r = await client.call(
          "dGitProvider" as any,
          "unPin",
          ipfservice.pinataConfig.key,
          ipfservice.pinataConfig.secret,
          cid
        );
        await read();
      } catch (err) {
        console.log(err);
      } finally {
        loaderservice.setLoading(false)
      }
      //await localipfsstorage.deleteFromStorage(o?.ipfs_pin_hash);
      //Utils.log("yes");
    } catch (e) {
      //Utils.log("no");
    }
  };

  return (
    <>
    
      <h4>Import from Pinata</h4>
      <Button onClick={async()=> deleteOldItems()} className='mb-2 btn btn-danger'>Remove old commits <FontAwesomeIcon icon={faTrash} /></Button>
      <ConfirmDelete
        title={"Importing"}
        text={"This will create a new workspace! Continue?"}
        ref={ModalRef}
      ></ConfirmDelete>
      <ConfirmDelete
        title={"Deleting"}
        text={"Are you sure you want to erase this item?"}
        ref={EraseModalRef}
      ></ConfirmDelete>
      <ConfirmDelete
        title={"Deletingold"}
        text={"Are you sure you want to delete commits that have been superseded?"}
        ref={EraseModalOld}
      ></ConfirmDelete>
      <div className="container-fluid">
        {(data || [])
          .filter((o: any) => {
            return o.metadata.keyvalues;
          })
          .map((o: any, index: any) => {
            return (
              <div key={index} className="row p-1">
                <Card className="w-75">
                  <Card.Body>
                    <h5>{o.metadata.name}</h5>
                    <div className="row">
                      <div className="col">IPFS</div>
                      <div className="col">{o?.ipfs_pin_hash}</div>
                    </div>
                    <div className="row">
                      <div className="col">DATE EXPORTED</div>
                      <div className="col">
                        {dateFormat(
                          o?.date_pinned,
                          "dddd, mmmm dS, yyyy, h:MM:ss TT"
                        )}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col">MESSAGE</div>
                      <div className="col">
                        {o?.metadata?.keyvalues?.message}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col">OID</div>
                      <div className="col">{o?.metadata?.keyvalues?.ref}</div>
                    </div>
                    { o.hasChild? 
                    
                    <>
                    <Alert className='mt-1' variant='warning'>This commit has been superseded. You can probably remove it.<br></br>
                    Newer commits:<br></br>
                    {
                      o.doubles.map((double: any) => {
                        return <div>{double.metadata?.name}</div>
                      })
                    }
                    </Alert>
                    </>:<></> }
                    <Accordion>
                      <Card>
                        <Card.Header>
                          <Accordion.Toggle
                            as={Button}
                            variant="link"
                            eventKey="0"
                          >
                            history
                          </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey="0">
                          <Card.Body>
                            {o?.metadata?.keyvalues?.commits.map(
                              (commit: any) => {
                                return (
                                  <div className="row">
                                    <div className="col-6">
                                      {commit.commit?.message}
                                    </div>
                                    <div className="col-6">
                                    { commit.commit?.committer?.timestamp ? <>{getDate(commit.commit?.committer?.timestamp)}</>:<>no date</> }
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </Card.Body>
                        </Accordion.Collapse>
                      </Card>
                    </Accordion>
                  </Card.Body>
                </Card>
                <div className="col">
                  <button
                    onClick={async () =>
                      await importFromCID(o.ipfs_pin_hash, o.metadata.name)
                    }
                    className="btn btn-primary btn-sm mr-2 import3b-btn"
                  >
                    import
                  </button>
                  {getViewButton(o.ipfs_pin_hash)}
                  <button
                    onClick={async () => await deleteItem(o.ipfs_pin_hash)}
                    className="btn btn-danger btn-sm delete3b-btn"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            );
          })}
        {data?.length === 0 ? <>Nothing has been stored here yet.</> : <></>}
      </div>
      <hr></hr>
    </>
  );
};
