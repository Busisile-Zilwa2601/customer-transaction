import {Filter } from '../intefaces/ITransaction';

export function buildFilter( filters?: Filter[]) {
    const mQuery: any = {};

    if(!filters || filters.length == 0)
    {
        return mQuery;
    }

    let startDate: string | undefined;
    let endDate: string | undefined;

    filters.forEach( f => {
        if(f.field === 'startDate')
        {
            startDate = f.value
        }else if(f.field === 'endDate'){
            endDate = f.value;
        }else {
            mQuery[f.field] = f.value
        }
    });

    if(startDate || endDate){
        mQuery.date = {};
        if(startDate)
        {
            mQuery.date.$gte = new Date(startDate);
        }
        if(endDate)
        {
            mQuery.date.$gte = new Date(endDate);

        }
    }

    return mQuery;
}