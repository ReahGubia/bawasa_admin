import { supabase } from './supabase'

export interface MeterReaderAssignment {
  id: number
  meter_reader_id: number  // ID from bawasa_meter_reader table
  consumer_id: string      // UUID from consumers table
  status: 'assigned' | 'ongoing' | 'completed'
  assigned_at: string
  created_at: string
  updated_at: string
}

export interface ConsumerAssignmentInfo {
  id: string
  water_meter_no: string
  full_name: string
  email: string
  address: string
}

export class MeterReaderAssignmentService {
  /**
   * Get all consumers assigned to a meter reader
   */
  static async getAssignedConsumers(meterReaderId: number): Promise<{
    data: ConsumerAssignmentInfo[] | null
    error: any
  }> {
    try {
      // First get the bawasa_meter_reader id from reader_id (account ID)
      const { data: meterReaderRecord, error: readerError } = await supabase
        .from('bawasa_meter_reader')
        .select('id')
        .eq('reader_id', meterReaderId)
        .maybeSingle()

      if (readerError || !meterReaderRecord) {
        return { data: [], error: null }
      }

      const meterReaderDbId = meterReaderRecord.id

      // Get all assignments for this meter reader from the junction table
      const { data: assignments, error: assignmentsError } = await supabase
        .from('meter_reader_assignments')
        .select(`
          consumer_id,
          status,
          consumers!consumer_id (
            id,
            water_meter_no,
            accounts!consumer_id (
              full_name,
              email,
              full_address
            )
          )
        `)
        .eq('meter_reader_id', meterReaderDbId)

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError)
        return { data: null, error: assignmentsError }
      }

      // Transform the data
      const consumers = (assignments || []).map((assignment: any) => {
        const consumer = assignment.consumers as any
        const account = consumer?.accounts as any

        return {
          id: consumer.id,
          water_meter_no: consumer.water_meter_no,
          full_name: account?.full_name || 'Unknown',
          email: account?.email || 'No email',
          address: account?.full_address || 'No address',
          status: assignment.status
        }
      })

      return { data: consumers, error: null }
    } catch (error) {
      console.error('Error in getAssignedConsumers:', error)
      return { data: null, error }
    }
  }

  /**
   * Assign consumers to a meter reader
   */
  static async assignConsumers(
    meterReaderId: number,
    consumerIds: string[]
  ): Promise<{ data: any[] | null; error: any }> {
    try {
      // Get the bawasa_meter_reader id from reader_id (account ID)
      const { data: meterReaderRecord, error: readerError } = await supabase
        .from('bawasa_meter_reader')
        .select('id')
        .eq('reader_id', meterReaderId)
        .maybeSingle()

      if (readerError || !meterReaderRecord) {
        return { data: null, error: new Error('Meter reader record not found') }
      }

      const meterReaderDbId = meterReaderRecord.id

      // Check for existing assignments to avoid duplicates
      const { data: existingAssignments, error: checkError } = await supabase
        .from('meter_reader_assignments')
        .select('consumer_id')
        .eq('meter_reader_id', meterReaderDbId)
        .in('consumer_id', consumerIds)

      if (checkError) {
        console.error('Error checking existing assignments:', checkError)
        // Continue anyway
      }

      const existingConsumerIds = new Set(
        (existingAssignments || []).map(a => a.consumer_id)
      )
      const newConsumerIds = consumerIds.filter(id => !existingConsumerIds.has(id))

      if (newConsumerIds.length === 0) {
        return { data: [], error: null }
      }

      // Create assignment records
      const assignments = newConsumerIds.map(consumerId => ({
        meter_reader_id: meterReaderDbId,
        consumer_id: consumerId,
        status: 'assigned',
        assigned_at: new Date().toISOString()
      }))

      const { data: insertedAssignments, error: insertError } = await supabase
        .from('meter_reader_assignments')
        .insert(assignments)
        .select()

      if (insertError) {
        console.error('Error creating assignments:', insertError)
        return { data: null, error: insertError }
      }

      // Update meter reader status to 'assigned' if not already
      await supabase
        .from('bawasa_meter_reader')
        .update({ status: 'assigned' })
        .eq('id', meterReaderDbId)

      return { data: insertedAssignments, error: null }
    } catch (error) {
      console.error('Error in assignConsumers:', error)
      return { data: null, error }
    }
  }

  /**
   * Update assignment status
   */
  static async updateAssignmentStatus(
    meterReaderId: number,
    consumerId: string,
    status: 'assigned' | 'ongoing' | 'completed'
  ): Promise<{ data: any; error: any }> {
    try {
      // Get the bawasa_meter_reader id
      const { data: meterReaderRecord, error: readerError } = await supabase
        .from('bawasa_meter_reader')
        .select('id')
        .eq('reader_id', meterReaderId)
        .maybeSingle()

      if (readerError || !meterReaderRecord) {
        return { data: null, error: new Error('Meter reader record not found') }
      }

      const meterReaderDbId = meterReaderRecord.id

      const { data, error } = await supabase
        .from('meter_reader_assignments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('meter_reader_id', meterReaderDbId)
        .eq('consumer_id', consumerId)
        .select()

      return { data, error }
    } catch (error) {
      console.error('Error updating assignment status:', error)
      return { data: null, error }
    }
  }

  /**
   * Remove assignment
   */
  static async removeAssignment(
    meterReaderId: number,
    consumerId: string
  ): Promise<{ data: any; error: any }> {
    try {
      // Get the bawasa_meter_reader id
      const { data: meterReaderRecord, error: readerError } = await supabase
        .from('bawasa_meter_reader')
        .select('id')
        .eq('reader_id', meterReaderId)
        .maybeSingle()

      if (readerError || !meterReaderRecord) {
        return { data: null, error: new Error('Meter reader record not found') }
      }

      const meterReaderDbId = meterReaderRecord.id

      const { error } = await supabase
        .from('meter_reader_assignments')
        .delete()
        .eq('meter_reader_id', meterReaderDbId)
        .eq('consumer_id', consumerId)

      if (error) {
        return { data: null, error }
      }

      return { data: { success: true }, error: null }
    } catch (error) {
      console.error('Error removing assignment:', error)
      return { data: null, error }
    }
  }
}

