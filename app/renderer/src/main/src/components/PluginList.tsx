import React, {useEffect, useRef, useState} from "react"
import {Button, Checkbox, Form, Popover, Space, Tooltip, Typography} from "antd"
import {QuestionCircleOutlined, UserOutlined, SettingOutlined, SearchOutlined} from "@ant-design/icons"
import {YakScript} from "../pages/invoker/schema"
import {AutoCard, AutoCardProps} from "./AutoCard"
import ReactResizeDetector from "react-resize-detector"
import {useMemoizedFn, useVirtualList} from "ahooks"
import {showModal} from "../utils/showModal"
import {InputInteger, InputItem} from "../utils/inputUtil"

import "./PluginList.css"

const {Text} = Typography

export interface PluginListProp extends AutoCardProps {
    loading: boolean
    lists: YakScript[]
    getLists: () => YakScript[]
    total: number
    selected: string[]
    allSelectScript: (flag: boolean) => any
    selectScript: (info: YakScript) => any
    unSelectScript: (info: YakScript) => any
    search: (params: {limit: number; keyword: string}) => any
    extra?: React.ReactNode
}

export const PluginList: React.FC<PluginListProp> = (props) => {
    const {
        loading,
        lists,
        getLists,
        total,
        selected,
        allSelectScript,
        selectScript,
        unSelectScript,
        search,
        extra,
        ...restCard
    } = props

    const [limit, setLimit] = useState(200)
    const [keyword, setKeyword] = useState("")
    const [indeterminate, setIndeterminate] = useState(false)
    const [checked, setChecked] = useState(false)

    const containerRef = useRef()
    const wrapperRef = useRef()
    const [list] = useVirtualList(getLists(), {
        containerTarget: containerRef,
        wrapperTarget: wrapperRef,
        itemHeight: 40,
        overscan: 20
    })
    const [vlistWidth, setVListWidth] = useState(260)
    const [vlistHeigth, setVListHeight] = useState(600)

    useEffect(() => {
        const totalYakScript = lists.length
        const filterArr = lists.filter((item) => selected.indexOf(item.ScriptName) > -1)

        const IndeterminateFlag =
            (filterArr.length > 0 && filterArr.length < totalYakScript && selected.length !== 0) ||
            (filterArr.length === 0 && selected.length !== 0)
        const checkedFlag = filterArr.length === totalYakScript && selected.length !== 0

        setIndeterminate(IndeterminateFlag)
        setChecked(checkedFlag)
    }, [selected, lists])

    const renderListItem = useMemoizedFn((info: YakScript) => {
        return (
            <div key={info.ScriptName} className='list-opt'>
                <Checkbox
                    checked={selected.includes(info.ScriptName)}
                    onChange={(r) => {
                        if (r.target.checked) selectScript(info)
                        else unSelectScript(info)
                    }}
                >
                    <Space>
                        <Text style={{maxWidth: vlistWidth}} ellipsis={{tooltip: true}}>
                            {info.ScriptName}
                        </Text>
                        {info.Help && (
                            <Button
                                size={"small"}
                                type={"link"}
                                onClick={() => {
                                    showModal({
                                        width: "40%",
                                        title: "Help",
                                        content: <>{info.Help}</>
                                    })
                                }}
                                icon={<QuestionCircleOutlined />}
                            />
                        )}
                    </Space>
                </Checkbox>
                <div style={{flex: 1, textAlign: "right"}}>
                    {info.Author && (
                        <Tooltip title={info.Author}>
                            <Button size={"small"} type={"link"} icon={<UserOutlined />} />
                        </Tooltip>
                    )}
                </div>
            </div>
        )
    })

    return (
        <div className='plugin-list-body'>
            <AutoCard
                size='small'
                bordered={false}
                {...restCard}
                extra={
                    <Space>
                        <Popover
                            title={"额外设置"}
                            trigger={["click"]}
                            content={
                                <div>
                                    <Form
                                        size={"small"}
                                        onSubmitCapture={(e) => {
                                            e.preventDefault()
                                            search({limit: limit, keyword: keyword})
                                        }}
                                    >
                                        <InputInteger
                                            label={"插件展示数量"}
                                            value={limit}
                                            setValue={setLimit}
                                            formItemStyle={{marginBottom: 4}}
                                        />
                                        <Form.Item colon={false} label={""} style={{marginBottom: 10}}>
                                            <Button type='primary' htmlType='submit'>
                                                刷新
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </div>
                            }
                        >
                            <Button size={"small"} icon={<SettingOutlined />} type={"link"} />
                        </Popover>
                        <Popover
                            title={"搜索插件关键字"}
                            trigger={["click"]}
                            content={
                                <div>
                                    <Form
                                        size={"small"}
                                        onSubmitCapture={(e) => {
                                            e.preventDefault()
                                            search({limit: limit, keyword: keyword})
                                        }}
                                    >
                                        <InputItem
                                            label={""}
                                            extraFormItemProps={{
                                                style: {marginBottom: 4},
                                                colon: false
                                            }}
                                            value={keyword}
                                            setValue={setKeyword}
                                        />
                                        <Form.Item colon={false} label={""} style={{marginBottom: 10}}>
                                            <Button type='primary' htmlType='submit'>
                                                搜索
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </div>
                            }
                        >
                            <Button size={"small"} type={!!keyword ? "primary" : "link"} icon={<SearchOutlined />} />
                        </Popover>
                        <Checkbox
                            indeterminate={indeterminate}
                            onChange={(r) => allSelectScript(r.target.checked)}
                            checked={checked}
                        >
                            全选
                        </Checkbox>
                        {extra || <></>}
                    </Space>
                }
            >
                <ReactResizeDetector
                    onResize={(width, height) => {
                        if (!width || !height) {
                            return
                        }
                        setVListWidth(width - 90)
                        setVListHeight(height)
                    }}
                    handleWidth={true}
                    handleHeight={true}
                    refreshMode={"debounce"}
                    refreshRate={50}
                />
                <div ref={containerRef as any} style={{height: vlistHeigth, overflow: "auto"}}>
                    <div ref={wrapperRef as any}>{list.map((i) => renderListItem(i.data))}</div>
                </div>
            </AutoCard>
        </div>
    )
}
