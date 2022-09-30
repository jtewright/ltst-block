import {
  BlockComponent,
  useGraphBlockService,
} from "@blockprotocol/graph/react";
import React, { useRef, useState, useCallback, useEffect } from "react";

/**
 * The file referenced here provides some base styling for your block.
 * You can delete it and write your own, but we encourage you to keep the styling scoped, e.g.
 * - use CSS modules (this approach), e.g. overwrite the contents of .block in base.module.scss
 * - use a CSS-in-JS solution
 * - use a shadow DOM
 * any of these ensure that your styling does not affect anything outside your block.
 */
import styles from "./base.module.scss";

/**
 * This defines the properties of the entity your block expects to be sent.
 * This entity is available to your block on props.graph.blockEntity.
 * To change the structure of the entity your block expects, change this type.
 */
type BlockEntityProperties = {
  name: string;
};

/**
 * This is the entry point for your block – the function that embedding applications will call to create it.
 * It is a function that takes a property object (known as "props" in React) and returns an element.
 * You should update this comment to describe what your block does, or remove the comment.
 */
export const App: BlockComponent<BlockEntityProperties> = ({
    graph: {
        /**
         * The properties sent to the block represent the messages sent automatically from the application to the block.
         * All block <> application messages are split into services, and so is this property object.
         * Here, we're extracting the 'graph' service messages from the property object.
         * – and then taking a single message from it, 'blockEntity'
         * @see https://blockprotocol.org/docs/spec/graph-service#message-definitions for other such messages
         */
        blockEntity: { entityId, properties },
    },
    }) => {
    /**
     * These two lines establish communication with the embedding application.
     * You don't need to change or understand them, but if you are curious:
     * 1. we create a 'ref' which will store a reference to an element – we need an element to communicate to the app via
     *   - the ref stores 'null' at first, but will be attached to the root element in our block when it exists
     * 2. we then feed the reference to a 'hook' (a function that uses React features), which sets up the graph service:
     *   - this takes care of the lower-level details of communicating with the embedding application
     *   - it returns a 'graphService' which has various methods on it, corresponding to messages your block can send
     *   - see an example below for sending an 'updateEntity' message, and a link to the other available messages
     */
    const blockRootRef = useRef<HTMLDivElement>(null);
    const { graphService } = useGraphBlockService(blockRootRef);


    const [channelId, setChannelId] = useState(entityId == "none" ? "" : entityId);
    const [update, setUpdate] = useState(null);
    const [channel, setChannel] = useState(null);
    const [loading, setLoading] = useState(channelId ? true : false);

    useEffect(() => {
        if (channelId && update == null) {
            // form submit
            loadChannel(channelId);
            updateEntity(channelId);
        }
    }, [loading, update]);

    const updateEntity = useCallback(
        async (channelId) => {
        console.log('graphService', graphService);
        const { data, errors } = await graphService.updateEntity({
            data: {
              entityId: channelId,
              properties: { name: "Latest Channel " + channelId },
            },
          });
    }, [entityId, loading, channelId]);

    const loadChannel = useCallback(
        async (e) => {
            if (e.preventDefault) e.preventDefault();
            setLoading(true);
            const apiKey = 't7Xk8lwWxrxszXVlK1mYF4epVaA5ZQO';
            const res = await fetch(`https://ltst.xyz/api/latestext?channelId=${channelId}&apiKey=${apiKey}`);
            const json = await res.json();
            setUpdate(json.update);
            setChannel(json.channel);
            setLoading(false);
        }, [loading, channelId],
    );

  return (
    <div style={{fontFamily: "Inter", maxWidth: "100%"}}>
            {loading ? 
                <div>Loading...</div>
            : update == null ?
                <form onSubmit={loadChannel}>
                    <input
                        value={channelId}
                        style={{width: "200px", height: "25px"}}
                        onChange={(e) => setChannelId(e.currentTarget.value)}
                        placeholder={"Channel ID"} />
                    <button style={{height: "25px"}} type="submit">Load</button>
                </form>
            :
                <div>
                    <div style={{fontSize: "1rem", marginBottom: "0.5rem", color: "#6b7280"}}>
                        {channel.title}
                        <div style={{display: "inline", marginLeft: "0.25rem"}}>
                        </div>
                    </div>
                    <div style={{backgroundColor: update.bgColor ?? "#f1f5f9", borderRadius: "0.5rem", padding: "1rem"}}>
                        {update.image ? <img style={{maxWidth: "100%", borderRadius: "0.5rem", marginBottom: "0.75rem"}} src={update.image} /> : null}
                        {update.text ? <div style={{fontSize: "1rem", color: update.textColor ?? "#0000000", whiteSpace: "pre-wrap"}}>{update.text}</div> : null}
                        {update.href ?
                            <div style={{marginTop: "0.5rem", fontSize: "0.9rem"}}>
                                <a href={update.href}>{update.href}</a>
                            </div>
                        : null}
                    </div>
                    <div style={{marginTop: "0.5rem", textAlign: "right", fontSize: "0.9rem", color: "6b7280"}}>
                        {new Date(update.ts/1e3).toLocaleString()} • <a href={`https://ltst.xyz/channel/${channelId}`}>{"ltst.xyz ↗"}</a>
                    </div>
                </div>
            }
        </div>
  );
};
